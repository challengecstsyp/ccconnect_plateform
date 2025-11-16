import React, { useState } from 'react';
import { FileText, Download, Trash2, Zap, Folder } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
const DocumentItem = ({ doc, onDownload, onDelete }) => (
    <div className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
                <span className="font-medium text-gray-800">{doc.name}</span>
                <p className="text-sm text-gray-500">
                    {doc.date}
                    {doc.type === 'Generated' && <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded">Généré par IA</span>}
                </p>
            </div>
        </div>
        <div className="flex items-center space-x-3">
            <button 
                onClick={() => onDownload(doc.id)} 
                className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                title="Télécharger le document"
            >
                <Download className="w-4 h-4 mr-1" />
                Télécharger
            </button>
            <button 
                onClick={() => onDelete(doc.id)} 
                className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
                title="Supprimer le document"
            >
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
            </button>
        </div>
    </div>
);

const DocumentsPage = () => {
    const mockDocuments = [
        { id: 1, name: "Chattouni_CV (4).pdf", date: "October 18, 2025 at 07:53 PM", category: 'My Resumes', type: 'Uploaded' },
        { id: 2, name: "CV_Optimise_IA.pdf", date: "October 18, 2025 at 08:30 PM", category: 'Generated Resumes', type: 'Generated' },
        { id: 3, name: "Lettre_Motivation_CDP.pdf", date: "October 17, 2025 at 11:00 AM", category: 'Cover Letters', type: 'Generated' },
    ];

    const [activeTab, setActiveTab] = useState('my_resumes');
    const [documents, setDocuments] = useState(mockDocuments);

    const handleDownload = (id) => {
        console.log(`Téléchargement du document ID: ${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
            setDocuments(documents.filter(doc => doc.id !== id));
            console.log(`Document ID: ${id} supprimé.`);
        }
    };

    const getFilteredDocuments = (category) => documents.filter(doc => doc.category === category);

    const TabButton = ({ id, label }) => {
        const count = getFilteredDocuments(label).length;
        return (
            <button
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 
                            ${activeTab === id 
                                ? `text-indigo-600 border-indigo-600` 
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                            }`}
            >
                {label} <span className="ml-1 text-xs font-bold p-1 rounded-full bg-gray-200">{count}</span>
            </button>
        );
    };

    const tabs = [
        { id: 'my_resumes', label: 'My Resumes' },
        { id: 'generated_resumes', label: 'Generated Resumes' },
        { id: 'cover_letters', label: 'Cover Letters' }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Folder className="w-7 h-7 mr-3 text-indigo-600" /> Vos Documents
            </h1>
            <p className="text-gray-600">Consultez et gérez vos documents téléchargés et générés.</p>

            <div className="border-b border-gray-200">
                <nav className="flex space-x-4">
                    {tabs.map(tab => (
                        <TabButton key={tab.id} id={tab.id} label={tab.label} />
                    ))}
                </nav>
            </div>

            <Card>
                <div className="divide-y divide-gray-100">
                    {tabs.map(tab => activeTab === tab.id && (
                        <div key={tab.id} className="min-h-[150px]">
                            {getFilteredDocuments(tab.label).length > 0 ? (
                                getFilteredDocuments(tab.label).map(doc => (
                                    <DocumentItem 
                                        key={doc.id} 
                                        doc={doc} 
                                        onDownload={handleDownload} 
                                        onDelete={handleDelete}
                                    />
                                ))
                            ) : (
                                <p className="p-4 text-gray-500">Aucun document dans cette catégorie.</p>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default DocumentsPage;