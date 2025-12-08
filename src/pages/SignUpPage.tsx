import { useState } from "react";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo_with_text_white.png";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Checkbox } from "src/components/ui/checkbox";
import backgroundImage from "../assets/HCPP.png";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, Timestamp, addDoc } from "firebase/firestore";
import { httpsCallable } from 'firebase/functions';
import { functions } from "../firebase/firebase";

interface FormData {
    firstName: string;
    lastName: string;
    clinicName: string;
    clinicAddress: string;
    clinicCity: string;
    clinicCountry: string;
    email: string;
    password: string;
}

interface Errors {
    firstName?: string;
    lastName?: string;
    clinicName?: string;
    clinicAddress?: string;
    clinicCity?: string;
    clinicCountry?: string;
    email?: string;
    password?: string;
}

const nameValidationRegex = /^[A-Za-z]+(?:[-' ][A-Za-z]+)*$/;
const clinicNameValidationRegex = /^[A-Za-z0-9\s\-]+$/;
const emailValidationRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignUpPage() {
    const [translation] = useTranslation("global");
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        clinicName: "",
        clinicAddress: "",
        clinicCity: "",
        clinicCountry: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Errors>({});
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);

    const goBack = () => {
        navigate(-1);
    }

    const toTermsAndConditions = () => {
        window.open("https://www.vizuhealth.com/terms-and-conditions", "_blank");
    }

    const toPrivacyPolicy = () => {
        window.open("https://www.vizuhealth.com/privacy-policy", "_blank");
    }

    const handleNext = () => {
        const currentErrors = validateCurrentStep();
        if (Object.keys(currentErrors).length === 0) {
            setStep(step + 1);
        } else {
            setErrors(currentErrors);
        }
    };

    const handleSubmit = async () => {
        const currentErrors = validateCurrentStep();
        if (Object.keys(currentErrors).length === 0) {
            try {
                setLoading(true);
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;

                // Call setAdminClaim here
                const setCustomClaims = httpsCallable(functions, 'setCustomClaims');
                await setCustomClaims({
                    uid: user.uid,
                    claims: [
                        { isAdmin: true },
                        { isHealthcareProfessional: true },
                    ]
                });

                // Wait for the token to refresh and include the new custom claims
                await user.getIdToken(true);

                // Create the clinic document and retrieve its ID
                const clinicRef = await addDoc(collection(db, "clinics"), {
                    contact_person_name: formData.firstName,
                    contact_person_last_name: formData.lastName,
                    contact_person_email: formData.email,
                    clinicName: formData.clinicName,
                    clinicAddress: formData.clinicAddress,
                    clinicCity: formData.clinicCity,
                    clinicCountry: formData.clinicCountry,
                    createdAt: Timestamp.now(),
                    healthcareProfessionals: [user.uid]
                });

                // Get UID of clinic
                const clinicID = clinicRef.id;

                await setDoc(doc(db, "healthcareProfessionals", user.uid), {
                    createdAt: user.metadata.creationTime,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    clinicName: formData.clinicName,
                    clinicAddress: formData.clinicAddress,
                    clinicCity: formData.clinicCity,
                    clinicCountry: formData.clinicCountry,
                    clinicID: clinicID,
                    email: formData.email,
                    approvedTerms: true,
                    approvedPrivacy: true,
                    isActive: false,
                    isOnboarded: false,
                    isAdmin: true,
                    isHealthcareProfessional: true,
                });

                // Wait a moment for claims to propagate
                setTimeout(async () => {
                    await user.getIdToken(true);
                    setLoading(false);
                    navigate("/dashboard");
                }, 5000);

            } catch (error: any) {
                setLoading(false);
                if (error.code === 'auth/email-already-in-use') {
                    setError('This email address is already in use.');
                } else if (error.code === 'auth/weak-password') {
                    setError('Please set a stronger password.');
                } else if (error.code === 'auth/invalid-email') {
                    setError('The email address is not valid.');
                } else if (error.message.includes('functions')) {
                    setError('Error with the cloud function. Please contact support.');
                } else {
                    setError('Error creating user. Please try again.');
                }
            }
        } else {
            setErrors(currentErrors);
        }
    };

    const validateCurrentStep = () => {
        const currentErrors: Errors = {};
        if (step === 1) {
            if (!formData.firstName) {
                currentErrors.firstName = "First name is required";
            } else if (!nameValidationRegex.test(formData.firstName)) {
                currentErrors.firstName = "Invalid first name format";
            }
            if (!formData.lastName) {
                currentErrors.lastName = "Last name is required";
            } else if (!nameValidationRegex.test(formData.lastName)) {
                currentErrors.lastName = "Invalid last name format";
            }
        } else if (step === 2) {
            if (!formData.clinicName) {
                currentErrors.clinicName = "Clinic name is required";
            } else if (!clinicNameValidationRegex.test(formData.clinicName)) {
                currentErrors.clinicName = "Invalid clinic name format";
            }
            if (!formData.clinicAddress) {
                currentErrors.clinicAddress = "Clinic address is required";
            }
            if (!formData.clinicCity) {
                currentErrors.clinicCity = "Clinic city is required";
            } else if (!nameValidationRegex.test(formData.clinicCity)) {
                currentErrors.clinicCity = "Invalid clinic city format";
            }
            if (!formData.clinicCountry) {
                currentErrors.clinicCountry = "Clinic country is required";
            } else if (!nameValidationRegex.test(formData.clinicCountry)) {
                currentErrors.clinicCountry = "Invalid clinic country format";
            }
        } else if (step === 3) {
            if (!formData.email) {
                currentErrors.email = "Email is required";
            } else if (!emailValidationRegex.test(formData.email)) {
                currentErrors.email = "Invalid email format";
            }
            if (!formData.password) {
                currentErrors.password = "Password is required";
            }
        }
        return currentErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <div>
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_first_name')}</p>
                            <Input
                                name="firstName"
                                placeholder={translation('signUpPage.placeholder_first_name')}
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                type="text"
                            />
                            {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_last_name')}</p>
                            <Input
                                name="lastName"
                                placeholder={translation('signUpPage.placeholder_last_name')}
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                type="text"
                            />
                            {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div>
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_clinic_name')}</p>
                            <Input
                                name="clinicName"
                                placeholder={translation('signUpPage.placeholder_clinic_name')}
                                value={formData.clinicName}
                                onChange={handleChange}
                                required
                                type="text"
                            />
                            {errors.clinicName && <p className="text-red-600 text-xs mt-1">{errors.clinicName}</p>}
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_clinic_address')}</p>
                            <Input
                                name="clinicAddress"
                                placeholder={translation('signUpPage.placeholder_clinic_address')}
                                value={formData.clinicAddress}
                                onChange={handleChange}
                                required
                                type="text"
                            />
                            {errors.clinicAddress && <p className="text-red-600 text-xs mt-1">{errors.clinicAddress}</p>}
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_clinic_city')}</p>
                            <Input
                                name="clinicCity"
                                placeholder={translation('signUpPage.placeholder_clinic_city')}
                                value={formData.clinicCity}
                                onChange={handleChange}
                                required
                                type="text"
                            />
                            {errors.clinicCity && <p className="text-red-600 text-xs mt-1">{errors.clinicCity}</p>}
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_clinic_country')}</p>
                            <Input
                                name="clinicCountry"
                                placeholder={translation('signUpPage.placeholder_clinic_country')}
                                value={formData.clinicCountry}
                                onChange={handleChange}
                                required
                                type="text"
                            />
                            {errors.clinicCountry && <p className="text-red-600 text-xs mt-1">{errors.clinicCountry}</p>}
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div>
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_email')}</p>
                            <Input
                                name="email"
                                placeholder={translation('signUpPage.placeholder_email')}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                type="email"
                            />
                            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div className="mt-2">
                            <p className="text-xs font-medium mb-1">{translation('signUpPage.label_password')}</p>
                            <Input
                                name="password"
                                placeholder={translation('signUpPage.placeholder_password')}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                type="password"
                            />
                            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div className="items-top flex space-x-3 mt-6">
                            <Checkbox id="terms-and-conditions" onCheckedChange={(checked) => setIsTermsAccepted(checked as boolean)} />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor="terms-and-conditions"
                                    className="text-sm font-medium leading-none"
                                >
                                    Accept Terms and Conditions & Privacy Policy
                                </label>
                                <p className="text-xs font-normal text-muted-foreground">
                                    By registering an account you acknowledge and agree to our <span className="text-blue-600 hover:underline" onClick={toTermsAndConditions}>Terms and Conditions</span> and <span className="text-blue-600 hover:underline" onClick={toPrivacyPolicy}>Privacy Policy</span>.
                                </p>
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center h-full lg:flex-row lg:w-screen lg:h-screen lg:px-4 lg:py-4 lg:gap-4 xl:px-8 xl:py-8 xl:gap-8">
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

            <div className="flex flex-col rounded-none w-full px-6 justify-between pt-16 pb-4 lg:w-2/4 h-full flex justify-center items-center lg:rounded-lg">
                <div className="lg:w-2/4"></div>
                <div className="w-full md:w-3/5 lg:w-11/12 xl:w-3/6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <h1 className="flex flex-row items-center text-2xl md:text-2xl text-blue-600 font-light animate-pulse">
                                {translation('signUpPage.waiting_text')}
                                <span className="dot-1 ml-2">.</span>
                                <span className="dot-2">.</span>
                                <span className="dot-3">.</span>
                            </h1>
                        </div>
                    ) : (
                        <Card className="shadow-none border-none rounded-md">
                            <CardHeader className="px-0 py-0">
                                <CardTitle className="text-2xl md:text-3xl font-medium">{translation('signUpPage.heading')}</CardTitle>
                                <CardDescription>{translation('signUpPage.subheading')}</CardDescription>
                            </CardHeader>
                            <div className="flex flex-col">
                                <form className="mt-14" title="Sign Up Form" noValidate>
                                    <div className="flex flex-col gap-3">
                                        {renderStepContent()}

                                        {error && (
                                            <div className="bg-red-100 text-sm rounded-sm p-4 text-red-700 mt-6">
                                                <p className="font-light text-sm">{error}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2 mt-10">
                                            {step < 3 ? (
                                                <Button onClick={handleNext} className="w-full px-6 py-6 text-sm" size="lg" variant="outline" type="button">
                                                    {translation('signUpPage.button_next')}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={handleSubmit}
                                                    className="w-full px-6 py-6 text-sm font-normal"
                                                    size="lg"
                                                    variant="default"
                                                    type="button"
                                                    disabled={!isTermsAccepted || !formData.email || !formData.password || !!errors.email || !!errors.password}
                                                >
                                                    {translation('signUpPage.create_account_button')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </Card>
                    )}
                </div>
                <div className="flex flex-row mt-8 lg:mt-0">
                    <Button variant="link" className="font-normal text-black hover:no-underline">
                        {translation('landingPage.Login.all_rights_reserved')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;
