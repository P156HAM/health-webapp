import React, { ReactNode } from 'react';

interface BiomarkerCardTemplateProps {
    children: ReactNode;
    heading: string;
    subheading: string;
}

const BiomarkerCardTemplate: React.FC<BiomarkerCardTemplateProps> = ({ children, heading, subheading }) => {

    return (
        <div className='w-full px-0'>
            <h1 className='text-xl text-black font-normal'>{heading}</h1>
            <p className='text-black/55 font-normal text-sm mt-1'>{subheading}</p>
            <div className='w-full mt-12'>
                {children}
            </div>
        </div>
    );
}

export default BiomarkerCardTemplate;
