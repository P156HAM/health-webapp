import '../../styles/AuthenticationAnimation.css';
import { useTranslation } from 'react-i18next';
import logo from "../../assets/logo_with_text_white.png"
import { Button } from "src/components/ui/button"
import backgroundImage from "../../assets/HCPP.png";
import { ArrowLeft } from "lucide-react";

function AccessNotAuthorised() {
    const [translation] = useTranslation("global");

    const goBack = () => {
        window.location.reload();
    }

    return (
        <div className="flex flex-col flex-col-reverse items-center h-full lg:flex-row lg:w-screen lg:h-screen lg:px-4 lg:py-4 lg:gap-4 xl:px-8 xl:py-8 xl:gap-8">
            <div className="relative w-full lg:w-2/4 h-full">
                <img
                    src={backgroundImage}
                    className="w-full h-full object-cover rounded-none lg:rounded-xl"
                    alt="Healthcare professional and patient"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-600 opacity-100 rounded-none lg:rounded-xl"></div>
                <div className="absolute top-12 lg:top-20 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <img
                        src={logo}
                        alt="Vizu Health logo"
                        className="w-[200px] object-contain"
                    />
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-6 py-6 lg:pl-12 lg:pr-16 lg:py-12">
                    <h1 className="text-2xl font-normal lg:text-6xl text-white lg:font-normal">{translation('landingPage.Login.heading')}</h1>
                    <p className="text-sm text-white font-light mt-1 lg:mt-4 lg:text-lg">{translation('landingPage.Login.subheading')}</p>

                    {/** Tablet and Desktop Buttons */}
                    <div className="hidden md:flex md:lex-row md:gap-1 md:gap-2 md:mt-6 lg:mt-10">
                        <Button size={'lg'} onClick={goBack} variant={'default'} className="w-fit lg:py-6 text-xs lg:text-sm border bg-white border-white text-blue-600 hover:bg-white hover:border-white hover:text-blue-600">
                            <ArrowLeft className="w-4 h-4 mr-3" />
                            {translation('landingPage.Login.go_back_button')}
                        </Button>
                    </div>

                    {/** Mobile Buttons */}
                    <div className="md:hidden flex flex-row gap-2 mt-6">
                        <Button size={'sm'} onClick={goBack} variant={'default'} className="w-fit px-6 py-5 text-xs border bg-white border-white text-blue-600 hover:bg-white hover:border-white hover:text-blue-600">
                            {translation('landingPage.Login.go_back_button')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col rounded-none w-full px-6 md:px-4 justify-between pt-16 pb-4 lg:w-2/4 h-full flex justify-center items-center lg:rounded-lg">
                <div className="lg:w-2/4"></div>
                <div className="w-full flex flex-col gap-6 md:w-3/5 lg:w-11/12 xl:w-3/6 text-left">
                    <h1 className="font-medium text-red-600 text-5xl">{translation('landingPage.Login.unauthorised')}</h1>
                    <p className="font-normal text-red-600 text-xl">{translation('landingPage.Login.unauthorised_suheading')}</p>
                </div>
                <div className="flex flex-row mt-8 lg:mt-0">
                </div>
            </div >
        </div >
    );
}

export default AccessNotAuthorised;