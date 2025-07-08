import React from 'react';

const OnboardingProgress = ({ isTrainingCompleted, isDocumentSubmitted, isDocumentsApproved }) => {
    const steps = [
        { id: 1, title: 'Training Videos', icon: '📺', status: isTrainingCompleted ? 'completed' : 'current' },
        { id: 2, title: 'Document Upload', icon: '📄', status: isDocumentSubmitted ? 'completed' : isTrainingCompleted ? 'current' : 'pending' },
        { id: 3, title: 'Admin Review', icon: '👨‍💼', status: isDocumentsApproved ? 'completed' : isDocumentSubmitted ? 'current' : 'pending' },
        { id: 4, title: 'Onboarding Complete', icon: '🎉', status: isDocumentsApproved ? 'completed' : 'pending' }
    ];

    const getStepColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-500 text-white';
            case 'current': return 'bg-blue-500 text-white';
            default: return 'bg-gray-300 text-gray-600';
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Onboarding Progress</h2>
            <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getStepColor(step.status)}`}>
                                {step.status === 'completed' ? '✓' : step.icon}
                            </div>
                            <div className="mt-2 text-sm text-center">
                                <div className="font-medium">{step.title}</div>
                                <div className="text-gray-500 capitalize">{step.status}</div>
                            </div>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`h-1 w-16 mx-4 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OnboardingProgress;