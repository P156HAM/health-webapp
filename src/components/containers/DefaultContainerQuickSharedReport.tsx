import React, { ReactNode } from "react";
import NavigationMenu from "./NavigationMenu";
import SubscriptionInactive from "./SubscriptionInactive";
import { useAuth } from "../../auth/AuthProvider";
import AuthenticationLoading from "../containers/AuthenticationLoading";
import { useLocation } from "react-router-dom";

interface DefaultContainerQuickSharedReportProps {
    children: ReactNode;
}

// Default Container is only used for pages as logged in healthcare provider
const DefaultContainerQuickSharedReport: React.FC<DefaultContainerQuickSharedReportProps> = ({ children }) => {
    const { isActive, userData } = useAuth();
    const location = useLocation();
    const pathname = location.pathname;
    return (
        <div className="w-full h-screen flex flex-col lg:flex-row bg-white mb-4">
            {pathname.startsWith("/quick-shared-report") && (
                <div className="flex-grow h-full">
                    {children}
                </div>
            )}
        </div>
    );
};

export default DefaultContainerQuickSharedReport;
