import { useTranslation } from 'react-i18next';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';

function Page404() {
    const [translation] = useTranslation("global");
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    }

    return (
        <div className="flex flex-col gap-12 h-screen w-full bg-red-200 justify-center items-center">
            <div className='text-left px-8 py-8 md:px-24 md:py-24 bg-red-200 md:rounded-lg'>
                <Badge variant={'secondary'} className='font-light text-xs bg-red-600 text-white hover:bg-red-600 hover:text-white'>{translation('404.badge')}</Badge>
                <h1 className="text-3xl lg:text-4xl font-medium text-red-800 mt-12">{translation('404.heading')}</h1>
                <h1 className="text-md font-light text-red-800 mt-4">{translation('404.subheading')}</h1>
                <Button
                    variant={'outline'}
                    size={'lg'}
                    className="bg-white border-white text-red-900 mt-24 hover:border-white hover:bg-white hover:text-red-700 hover:shadow-sm group transition-all duration-300"
                    onClick={goBack}
                >
                    <ArrowLeftIcon
                        className="ml-2 mr-4 h-4 w-4 transform transition-transform duration-300 group-hover:-translate-x-2"
                    />
                    {translation('404.button_back')}
                </Button>
            </div>
        </div>
    )
}

export default Page404