import React, { ReactNode } from 'react';
import NavigationMenu from '../NavigationMenu';
import SubscriptionInactive from '../SubscriptionInactive';
import { useAuth } from '../../../auth/AuthProvider';
import AuthenticationLoading from "../AuthenticationLoading";

interface DefaultContainerReportProps {
    children: ReactNode;
}

// Default Container is only used for pages as logged in healthcare provider
const DefaultContainerReport: React.FC<DefaultContainerReportProps> = ({ children }) => {
    const { isActive, userData } = useAuth();

    return (
        <div className="w-full h-screen flex flex-col lg:flex-row">
            {!userData && (
                <AuthenticationLoading />
            )}
            {userData && (
                <>
                    <div className="lg:w-[250px] flex-none bg-white">
                        <NavigationMenu />
                    </div>
                    <div className="flex-grow h-full overflow-auto px-6 py-6 lg:px-20 lg:py-16 bg-white">
                        {!isActive && userData && (
                            <SubscriptionInactive />
                        )}
                        {children}
                    </div>
                </>
            )}
        </div>
    );
}

export default DefaultContainerReport;
