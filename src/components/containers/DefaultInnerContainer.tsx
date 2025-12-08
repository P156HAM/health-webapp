import React, { ReactNode } from 'react';

interface DefaultInnerContainerProps {
    children: ReactNode;
}

// Default Inner Container is only used for pages as logged in healthcare provider
const DefaultInnerContainer: React.FC<DefaultInnerContainerProps> = ({ children }) => {

    return (
        <div className="flex flex-col flex-grow h-full mt-12 lg:mt-8">
            {children}
        </div>
    );
}

export default DefaultInnerContainer;