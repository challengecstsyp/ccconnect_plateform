"""
Storage utilities for interview data persistence.

This module handles saving, loading, and managing interview session data
in JSON format. Provides thread-safe operations and backup functionality.
"""

import json
import os
import shutil
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import threading
from contextlib import contextmanager

try:
    from backend.utils.config import InterviewConfig
    from backend.utils.id_utils import get_interview_filename, sanitize_filename
except ImportError:
    # Fallback for direct execution
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    from utils.config import InterviewConfig
    from utils.id_utils import get_interview_filename, sanitize_filename


class InterviewStorage:
    """
    Thread-safe storage manager for interview session data.
    
    Handles:
    - JSON serialization/deserialization
    - File system operations
    - Backup creation
    - Data validation
    - Concurrent access protection
    """
    
    def __init__(self, storage_dir: Optional[Path] = None):
        """
        Initialize storage manager.
        
        Args:
            storage_dir: Directory for storing interview files (defaults to config)
        """
        self.storage_dir = storage_dir or InterviewConfig.INTERVIEWS_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()  # Reentrant lock for nested operations
        
        # Create backup directory
        self.backup_dir = self.storage_dir / "backups"
        self.backup_dir.mkdir(exist_ok=True)
    
    @contextmanager
    def _file_lock(self):
        """Context manager for thread-safe file operations."""
        with self._lock:
            yield
    
    def save_interview(self, interview_data: Dict[str, Any]) -> bool:
        """
        Save interview session data to JSON file.
        
        Args:
            interview_data: Interview session dictionary
        
        Returns:
            True if saved successfully, False otherwise
        """
        try:
            interview_id = interview_data.get("interview_id")
            if not interview_id:
                raise ValueError("Interview data must contain 'interview_id'")
            
            filename = get_interview_filename(interview_id)
            filepath = self.storage_dir / filename
            
            with self._file_lock():
                # Create backup if file exists
                if filepath.exists():
                    self._create_backup(filepath)
                
                # Save with atomic write
                temp_filepath = filepath.with_suffix('.tmp')
                with open(temp_filepath, 'w', encoding='utf-8') as f:
                    json.dump(interview_data, f, indent=2, ensure_ascii=False)
                
                # Atomic rename
                temp_filepath.replace(filepath)
            
            return True
            
        except Exception as e:
            print(f"Error saving interview {interview_id}: {e}")
            return False
    
    def load_interview(self, interview_id: str) -> Optional[Dict[str, Any]]:
        """
        Load interview session data from JSON file.
        
        Args:
            interview_id: Unique interview identifier
        
        Returns:
            Interview data dictionary or None if not found
        """
        try:
            filename = get_interview_filename(interview_id)
            filepath = self.storage_dir / filename
            
            if not filepath.exists():
                return None
            
            with self._file_lock():
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            
            # Validate loaded data
            if not self._validate_interview_data(data):
                print(f"Warning: Invalid interview data structure for {interview_id}")
                return None
            
            return data
            
        except Exception as e:
            print(f"Error loading interview {interview_id}: {e}")
            return None
    
    def delete_interview(self, interview_id: str) -> bool:
        """
        Delete interview session file.
        
        Args:
            interview_id: Unique interview identifier
        
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            filename = get_interview_filename(interview_id)
            filepath = self.storage_dir / filename
            
            if not filepath.exists():
                return False
            
            with self._file_lock():
                # Create backup before deletion
                self._create_backup(filepath)
                filepath.unlink()
            
            return True
            
        except Exception as e:
            print(f"Error deleting interview {interview_id}: {e}")
            return False
    
    def list_interviews(self, 
                       limit: Optional[int] = None,
                       sort_by: str = "created",
                       include_summary: bool = False) -> List[Dict[str, Any]]:
        """
        List available interview sessions.
        
        Args:
            limit: Maximum number of interviews to return
            sort_by: Sort criteria ("created", "modified", "id")
            include_summary: Whether to include interview summaries
        
        Returns:
            List of interview metadata
        """
        try:
            with self._file_lock():
                interviews = []
                
                for filepath in self.storage_dir.glob("*.json"):
                    if filepath.name.startswith("backup_"):
                        continue  # Skip backup files
                    
                    try:
                        stat = filepath.stat()
                        metadata = {
                            "interview_id": filepath.stem,
                            "filename": filepath.name,
                            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            "size_bytes": stat.st_size
                        }
                        
                        if include_summary:
                            # Load basic info without full data
                            data = self.load_interview(filepath.stem)
                            if data:
                                metadata.update({
                                    "job_title": data.get("settings", {}).get("job_title"),
                                    "num_questions": data.get("settings", {}).get("num_questions"),
                                    "questions_answered": len(data.get("questions", [])),
                                    "current_level": data.get("state", {}).get("current_level"),
                                    "is_complete": data.get("summary") is not None
                                })
                        
                        interviews.append(metadata)
                        
                    except Exception as e:
                        print(f"Error reading metadata for {filepath}: {e}")
                        continue
                
                # Sort interviews
                if sort_by == "created":
                    interviews.sort(key=lambda x: x["created"], reverse=True)
                elif sort_by == "modified":
                    interviews.sort(key=lambda x: x["modified"], reverse=True)
                elif sort_by == "id":
                    interviews.sort(key=lambda x: x["interview_id"])
                
                # Apply limit
                if limit:
                    interviews = interviews[:limit]
                
                return interviews
                
        except Exception as e:
            print(f"Error listing interviews: {e}")
            return []
    
    def exists(self, interview_id: str) -> bool:
        """
        Check if interview session exists.
        
        Args:
            interview_id: Unique interview identifier
        
        Returns:
            True if interview exists, False otherwise
        """
        filename = get_interview_filename(interview_id)
        filepath = self.storage_dir / filename
        return filepath.exists()
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """
        Get storage usage statistics.
        
        Returns:
            Dictionary with storage statistics
        """
        try:
            with self._file_lock():
                total_files = 0
                total_size = 0
                backup_files = 0
                backup_size = 0
                
                # Count main files
                for filepath in self.storage_dir.glob("*.json"):
                    if not filepath.name.startswith("backup_"):
                        total_files += 1
                        total_size += filepath.stat().st_size
                
                # Count backup files
                for filepath in self.backup_dir.glob("backup_*.json"):
                    backup_files += 1
                    backup_size += filepath.stat().st_size
                
                return {
                    "interviews_count": total_files,
                    "total_size_bytes": total_size,
                    "total_size_mb": round(total_size / (1024 * 1024), 2),
                    "backup_count": backup_files,
                    "backup_size_bytes": backup_size,
                    "storage_directory": str(self.storage_dir),
                    "backup_directory": str(self.backup_dir)
                }
                
        except Exception as e:
            print(f"Error getting storage stats: {e}")
            return {"error": str(e)}
    
    def cleanup_old_backups(self, keep_days: int = 7) -> int:
        """
        Clean up old backup files.
        
        Args:
            keep_days: Number of days to keep backups
        
        Returns:
            Number of backups deleted
        """
        try:
            cutoff_time = datetime.now().timestamp() - (keep_days * 24 * 3600)
            deleted_count = 0
            
            with self._file_lock():
                for backup_file in self.backup_dir.glob("backup_*.json"):
                    if backup_file.stat().st_mtime < cutoff_time:
                        backup_file.unlink()
                        deleted_count += 1
            
            return deleted_count
            
        except Exception as e:
            print(f"Error cleaning up backups: {e}")
            return 0
    
    def _create_backup(self, filepath: Path) -> bool:
        """
        Create backup of existing file.
        
        Args:
            filepath: Path to file to backup
        
        Returns:
            True if backup created successfully
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"backup_{timestamp}_{filepath.name}"
            backup_path = self.backup_dir / backup_name
            
            shutil.copy2(filepath, backup_path)
            return True
            
        except Exception as e:
            print(f"Error creating backup for {filepath}: {e}")
            return False
    
    def _validate_interview_data(self, data: Dict[str, Any]) -> bool:
        """
        Validate interview data structure.
        
        Args:
            data: Interview data to validate
        
        Returns:
            True if data structure is valid
        """
        required_fields = ["interview_id", "settings", "questions", "state"]
        
        # Check required top-level fields
        for field in required_fields:
            if field not in data:
                return False
        
        # Validate settings
        settings = data["settings"]
        settings_required = ["job_title", "num_questions", "soft_pct", "initial_level", "keywords"]
        for field in settings_required:
            if field not in settings:
                return False
        
        # Validate state
        state = data["state"]
        state_required = ["current_level", "asked_count", "recent_scores"]
        for field in state_required:
            if field not in state:
                return False
        
        return True
    
    def export_interview(self, interview_id: str, export_path: Path) -> bool:
        """
        Export interview data to specified location.
        
        Args:
            interview_id: Interview to export
            export_path: Destination file path
        
        Returns:
            True if exported successfully
        """
        try:
            data = self.load_interview(interview_id)
            if not data:
                return False
            
            export_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(export_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            print(f"Error exporting interview {interview_id}: {e}")
            return False
    
    def import_interview(self, import_path: Path) -> Optional[str]:
        """
        Import interview data from file.
        
        Args:
            import_path: Path to interview file to import
        
        Returns:
            Interview ID if imported successfully, None otherwise
        """
        try:
            with open(import_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not self._validate_interview_data(data):
                print("Invalid interview data structure")
                return None
            
            interview_id = data["interview_id"]
            
            if self.save_interview(data):
                return interview_id
            else:
                return None
                
        except Exception as e:
            print(f"Error importing interview from {import_path}: {e}")
            return None


# Global storage instance
_storage_instance = None
_storage_lock = threading.Lock()


def get_storage() -> InterviewStorage:
    """
    Get global storage instance (singleton pattern).
    
    Returns:
        InterviewStorage instance
    """
    global _storage_instance
    
    if _storage_instance is None:
        with _storage_lock:
            if _storage_instance is None:
                _storage_instance = InterviewStorage()
    
    return _storage_instance


# Convenience functions
def save_interview(interview_data: Dict[str, Any]) -> bool:
    """Save interview using global storage instance."""
    return get_storage().save_interview(interview_data)


def load_interview(interview_id: str) -> Optional[Dict[str, Any]]:
    """Load interview using global storage instance."""
    return get_storage().load_interview(interview_id)


def delete_interview(interview_id: str) -> bool:
    """Delete interview using global storage instance."""
    return get_storage().delete_interview(interview_id)


def list_interviews(**kwargs) -> List[Dict[str, Any]]:
    """List interviews using global storage instance."""
    return get_storage().list_interviews(**kwargs)