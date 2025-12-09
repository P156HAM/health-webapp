import { useState } from 'react'
import React from 'react'
import '../styles/AuthenticationAnimation.css'
import { useTranslation } from 'react-i18next'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from 'src/firebase/firebase'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo_with_text_white.png'
import { Card, CardDescription, CardHeader, CardTitle } from 'src/components/ui/card'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import ForgotPassword from '../components/containers/ForgotPassword'
import backgroundImage from '../assets/HCPP.png'
import { ArrowLeft } from 'lucide-react'
import { useLogSnag } from '@logsnag/react'
import { isMockMode } from '../mocks/config'

function LoginPage() {
  const [translation, i18next] = useTranslation('global')
  const navigate = useNavigate()
  const { setUserId, track } = useLogSnag()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()

    // In mock mode, set auth state and navigate to dashboard
    if (isMockMode) {
      setLoading(true)
      // Small delay to simulate login
      await new Promise((resolve) => setTimeout(resolve, 300))
      localStorage.setItem('mockAuthState', 'loggedIn')
      // Dispatch custom event to notify AuthProvider
      window.dispatchEvent(new Event('mockAuthStateChanged'))
      // Use navigate instead of window.location for better React Router integration
      navigate('/dashboard')
      setLoading(false)
      return
    }

    if (email.trim() === '' || password.trim() === '') {
      setError('Insert your email and password.')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Insert a valid email address.')
      return
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      user.getIdTokenResult().then(async (idTokenResult) => {
        if (idTokenResult.claims.isHealthcareProfessional) {
          setLoading(false)
          setUserId(email)
          const loginTime = Math.floor(Date.now() / 1000)
          track({
            channel: 'online_users',
            event: 'User Logged In',
            icon: '🔓',
            notify: true,
            timestamp: loginTime,
          })
          localStorage.setItem('loginTime', loginTime.toString())
        } else {
          setLoading(false)
          await signOut(auth)
          setError('You are not authorised to access premium features of Vizu Health.')
          track({
            channel: 'online_users',
            event: 'Unauthorized Access Attempt',
            description: `Unauthorized access attempt by ${email}`,
            icon: '🚫',
            notify: true,
          })
        }
      })
    } catch (error: any) {
      let errorMessage = 'Failed to log in. Please try again.'
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage =
            'The email and/or password is incorrect or there is no account with this email.'
          break
        case 'auth/wrong-password':
          errorMessage =
            'The email and/or password is incorrect or there is no account  with this email.'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.'
          break
        default:
          errorMessage = 'Login failed. Please try again.'
          break
      }
      setError(errorMessage)
      track({
        channel: 'online_users',
        event: 'Login Failed',
        description: `${errorMessage} Email: ${email}`,
        icon: '❌',
        notify: false,
      })
    }
  }

  const toggleForgotPassword = () => {
    setIsForgotPasswordOpen((prevState) => !prevState)
  }

  const toRegister = () => {
    navigate('/register')
  }

  const goBack = () => {
    navigate(-1)
  }

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
          <img src={logo} alt="Vizu Health logo" className="w-[200px] object-contain" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 py-6 lg:pl-12 lg:pr-16 lg:py-12">
          <h1 className="text-2xl font-normal lg:text-6xl text-white lg:font-normal">
            {translation('landingPage.Login.heading')}
          </h1>
          <p className="text-sm text-white font-light mt-1 lg:mt-4 lg:text-lg">
            {translation('landingPage.Login.subheading')}
          </p>

          {/** Tablet and Desktop Buttons */}
          <div className="hidden md:flex md:lex-row md:gap-1 md:gap-2 md:mt-6 lg:mt-10">
            <Button
              size={'lg'}
              onClick={goBack}
              variant={'default'}
              className="w-fit lg:py-6 text-xs lg:text-sm border bg-white border-white text-blue-600 hover:bg-white hover:border-white hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-3" />
              {translation('landingPage.Login.go_back_button')}
            </Button>
            <Button
              size={'lg'}
              onClick={toRegister}
              variant={'default'}
              className="w-fit lg:py-6 text-xs lg:text-sm bg-transparent border border-white text-white hover:bg-white hover:border-white hover:text-blue-600"
            >
              {translation('landingPage.Login.register_button')}
            </Button>
          </div>

          {/** Mobile Buttons */}
          <div className="md:hidden flex flex-row gap-2 mt-6">
            <Button
              size={'sm'}
              onClick={goBack}
              variant={'default'}
              className="w-fit px-6 py-5 text-xs border bg-white border-white text-blue-600 hover:bg-white hover:border-white hover:text-blue-600"
            >
              {translation('landingPage.Login.go_back_button')}
            </Button>
            <Button
              size={'sm'}
              onClick={toRegister}
              variant={'default'}
              className="w-fit px-6 py-5 text-xs bg-transparent border border-white text-white hover:bg-white hover:border-white hover:text-blue-600"
            >
              {translation('landingPage.Login.register_button')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-none w-full px-6 md:px-4 justify-between pt-16 pb-4 lg:w-2/4 h-full flex justify-center items-center lg:rounded-lg">
        <div className="lg:w-2/4"></div>
        {loading ? (
          <div className="flex items-center justify-center h-full animate-pulse">
            <h1 className="flex flex-row items-center text-2xl md:text-2xl text-blue-600 font-normal">
              {translation('landingPage.Login.authenticating')}
              <span className="dot-1 ml-2">.</span>
              <span className="dot-2">.</span>
              <span className="dot-3">.</span>
            </h1>
          </div>
        ) : (
          <div className="w-full md:w-3/5 lg:w-11/12 xl:w-2/5">
            <Card className="shadow-none border-none rounded-md ">
              <CardHeader className="px-0 py-0">
                <CardTitle className="text-2xl md:text-3xl font-medium">
                  {translation('landingPage.Login.login')}
                </CardTitle>
                <CardDescription>{translation('landingPage.Login.login_subtext')}</CardDescription>
              </CardHeader>
              <div className="flex flex-col">
                {isMockMode ? (
                  <form className="mt-14" onSubmit={handleLogin} title="Login Form" noValidate>
                    <div className="flex flex-col gap-2">
                      <div className="bg-blue-50 border border-blue-200 text-sm rounded-sm p-4 text-blue-700 mb-4">
                        <p className="font-light text-sm">
                          Demo Mode: Click the button below to access the dashboard with sample
                          data.
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 mt-6">
                        <Button
                          className="w-full px-6 py-6 text-sm"
                          size="lg"
                          type="submit"
                          variant="default"
                        >
                          {translation('landingPage.Login.login_button')}
                        </Button>
                        <Button
                          className="w-full px-6 py-6 text-sm"
                          size="lg"
                          variant="outline"
                          type="button"
                          onClick={toRegister}
                        >
                          {translation('landingPage.Login.register_button')}
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form className="mt-14" onSubmit={handleLogin} title="Login Form" noValidate>
                    <div className="flex flex-col gap-2">
                      <div>
                        <p className="text-xs font-medium mb-1">
                          {translation('landingPage.Login.email')}
                        </p>
                        <Input
                          id="email"
                          placeholder={translation('landingPage.Login.email_placeholder')}
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div>
                        <p className="text-xs font-medium mb-1">
                          {translation('landingPage.Login.password')}
                        </p>
                        <Input
                          id="password"
                          placeholder={translation('landingPage.Login.password_placeholder')}
                          required
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="link"
                            className="text-blue-600 text-sm font-normal ml-0 pl-0 text-xs"
                            onClick={toggleForgotPassword}
                          >
                            {translation('landingPage.Login.forgot_password')}
                          </Button>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-100 text-sm rounded-sm p-4 text-red-700">
                          <p className="font-light text-sm">{error}</p>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-6">
                        <Button
                          className="w-full px-6 py-6 text-sm"
                          size="lg"
                          type="submit"
                          variant="default"
                        >
                          {translation('landingPage.Login.login_button')}
                        </Button>
                        <Button
                          className="w-full px-6 py-6 text-sm"
                          size="lg"
                          variant="outline"
                          type="button"
                          onClick={toRegister}
                        >
                          {translation('landingPage.Login.register_button')}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </div>
        )}
        <div className="flex flex-row mt-8 lg:mt-0">
          <Button variant="link" className="font-normal text-black hover:no-underline">
            {translation('landingPage.Login.all_rights_reserved')}
          </Button>
        </div>
      </div>
      {isForgotPasswordOpen && (
        <ForgotPassword isOpen={isForgotPasswordOpen} onClose={toggleForgotPassword} />
      )}
    </div>
  )
}

export default LoginPage
