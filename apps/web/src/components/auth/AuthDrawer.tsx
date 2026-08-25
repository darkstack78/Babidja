'use client';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/validators'
import { useAuthStore } from '@/store/useAuthStore'
import { sendOtp, verifyOtp, loginEmail, registerEmail } from '@/lib/api/auth'
import { extractErrorMessage } from '@/lib/api/errors'
import { AuthTabs, GoogleIcon, PhoneField } from './AuthShared'
import Input, { PasswordInput } from '../ui/Input'
import Button from '../ui/Button'
import Logo from '../Logo'

export default function AuthDrawer() {
  const router = useRouter()
  const { isDrawerOpen, closeDrawer, drawerView, openDrawer, setSession } = useAuthStore()
  const [tab, setTab] = useState('email') // Changed default to email since we have validation for it

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: errorsLogin }, reset: resetLogin } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const { register: registerSignup, handleSubmit: handleSubmitSignup, formState: { errors: errorsSignup }, reset: resetSignup } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  // UX-06 : Compteur de tentatives OTP (max 3 côté backend)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const OTP_MAX_ATTEMPTS = 3

  const resetPhoneFlow = () => {
    setPhone('')
    setOtpCode('')
    setOtpSent(false)
    setPhoneError('')
    setOtpAttempts(0)
  }

  // Prevent scroll when drawer is open, and reset the forms once it closes.
  // Doit rester dans un effect : la remise à zéro ne doit se produire qu'à la
  // transition isDrawerOpen -> false, pas à chaque rendu.
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      resetLogin()
      resetSignup()
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetPhoneFlow()
      setFormError('')
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isDrawerOpen, resetLogin, resetSignup])

  if (!isDrawerOpen) return null

  const onLoginSubmit = async (data: LoginFormData) => {
    setFormError('')
    setLoading(true)
    try {
      const { accessToken, refreshToken, user } = await loginEmail(data.email, data.password)
      setSession({ accessToken, refreshToken, user })
      closeDrawer()
    } catch (error) {
      setFormError(extractErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setFormError('')
    setLoading(true)
    try {
      const { accessToken, refreshToken, user } = await registerEmail({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      setSession({ accessToken, refreshToken, user })
      closeDrawer()
    } catch (error) {
      setFormError(extractErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!phone || phoneLoading) return
    setPhoneError('')
    setPhoneLoading(true)
    try {
      await sendOtp(phone)
      setOtpSent(true)
    } catch (error) {
      setPhoneError(extractErrorMessage(error, "Impossible d'envoyer le code. Vérifiez le numéro."))
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6 || phoneLoading) return
    setPhoneError('')
    setPhoneLoading(true)
    try {
      const { accessToken, refreshToken, user } = await verifyOtp(phone, otpCode)
      setSession({ accessToken, refreshToken, user })
      closeDrawer()
    } catch {
      const newAttempts = otpAttempts + 1
      setOtpAttempts(newAttempts)
      const remaining = OTP_MAX_ATTEMPTS - newAttempts
      if (remaining > 0) {
        setPhoneError(`Code invalide. Il vous reste ${remaining} tentative${remaining > 1 ? 's' : ''}.`)
      } else {
        setPhoneError('Trop de tentatives échouées. Demandez un nouveau code.')
        setOtpSent(false)
        setOtpCode('')
        setOtpAttempts(0)
      }
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleGoogleClick = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
    window.location.href = `${apiUrl}/auth/google`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform sm:rounded-l-3xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <Logo />
          <button
            onClick={closeDrawer}
            className="grid size-10 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {drawerView === 'login' ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-extrabold text-gray-900">Content de vous revoir</h2>
              <p className="mt-2 text-sm text-gray-500">Connectez-vous pour accéder à vos réservations.</p>

              <div className="mt-8">
                <AuthTabs
                  active={tab}
                  onChange={(id) => { setTab(id); setFormError(''); resetPhoneFlow() }}
                  tabs={[
                    { id: 'phone', label: 'Téléphone' },
                    { id: 'email', label: 'E-mail' },
                    { id: 'google', label: 'Google', icon: <GoogleIcon /> },
                  ]}
                />
              </div>

              {tab === 'phone' ? (
                <div className="mt-6 flex flex-col gap-4">
                  <PhoneField value={phone} onChange={setPhone} disabled={otpSent || phoneLoading} />
                  {otpSent && (
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Code reçu par SMS"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  )}
                  {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
                  {!otpSent ? (
                    <Button type="button" variant="secondary" size="lg" className="w-full" onClick={handleSendOtp} disabled={phoneLoading || !phone}>
                      {phoneLoading ? 'Envoi...' : 'Envoyer le code'}
                    </Button>
                  ) : (
                    <Button type="button" variant="secondary" size="lg" className="w-full" onClick={handleVerifyOtp} disabled={phoneLoading || otpCode.length !== 6}>
                      {phoneLoading ? 'Vérification...' : 'Vérifier le code'}
                    </Button>
                  )}
                </div>
              ) : tab === 'google' ? (
                <div className="mt-6">
                  <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoogleClick}>
                    <GoogleIcon /> Continuer avec Google
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="mt-6 flex flex-col gap-4">
                  <Input type="email" placeholder="Adresse e-mail" {...registerLogin('email')} error={errorsLogin.email?.message} />
                  <PasswordInput {...registerLogin('password')} error={errorsLogin.password?.message} />
                  {formError && <p className="text-sm text-red-600">{formError}</p>}
                  <button
                    type="button"
                    className="self-end text-sm font-semibold text-primary hover:underline"
                    onClick={() => { closeDrawer(); router.push('/auth/mot-de-passe-oublie') }}
                  >
                    Mot de passe oublié ?
                  </button>
                  <Button type="submit" variant="secondary" size="lg" className="mt-2 w-full" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              )}

              <p className="mt-6 text-center text-sm">
                Nouveau sur Babydja ?{' '}
                <button onClick={() => openDrawer('register')} className="font-semibold text-secondary hover:underline">
                  Inscrivez-vous
                </button>
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-extrabold text-gray-900">Créer un compte</h2>
              <p className="mt-2 text-sm text-gray-500">Rejoignez Babydja pour faciliter vos réservations.</p>

              <div className="mt-8">
                <AuthTabs
                  active={tab}
                  onChange={(id) => { setTab(id); setFormError(''); resetPhoneFlow() }}
                  tabs={[
                    { id: 'phone', label: 'Téléphone' },
                    { id: 'email', label: 'E-mail' },
                    { id: 'google', label: 'Google', icon: <GoogleIcon /> },
                  ]}
                />
              </div>

              {tab === 'phone' ? (
                <div className="mt-6 flex flex-col gap-4">
                  <PhoneField value={phone} onChange={setPhone} disabled={otpSent || phoneLoading} />
                  {otpSent && (
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="Code reçu par SMS"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                    />
                  )}
                  {phoneError && <p className="text-sm text-red-600">{phoneError}</p>}
                  {!otpSent ? (
                    <Button type="button" size="lg" className="w-full" onClick={handleSendOtp} disabled={phoneLoading || !phone}>
                      {phoneLoading ? 'Envoi...' : 'Envoyer le code'}
                    </Button>
                  ) : (
                    <Button type="button" size="lg" className="w-full" onClick={handleVerifyOtp} disabled={phoneLoading || otpCode.length !== 6}>
                      {phoneLoading ? 'Vérification...' : 'Vérifier le code'}
                    </Button>
                  )}
                </div>
              ) : tab === 'google' ? (
                <div className="mt-6">
                  <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoogleClick}>
                    <GoogleIcon /> Continuer avec Google
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitSignup(onRegisterSubmit)} className="mt-6 flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Input type="text" placeholder="Prénom" {...registerSignup('firstName')} error={errorsSignup.firstName?.message} />
                    <Input type="text" placeholder="Nom" {...registerSignup('lastName')} error={errorsSignup.lastName?.message} />
                  </div>
                  <Input type="email" placeholder="Adresse e-mail" {...registerSignup('email')} error={errorsSignup.email?.message} />
                  <PasswordInput {...registerSignup('password')} error={errorsSignup.password?.message} />
                  <PasswordInput placeholder="Confirmer le mot de passe" {...registerSignup('confirmPassword')} error={errorsSignup.confirmPassword?.message} />
                  {formError && <p className="text-sm text-red-600">{formError}</p>}
                  <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
                    {loading ? 'Création...' : 'S’inscrire'}
                  </Button>
                </form>
              )}

              <p className="mt-6 text-center text-sm">
                Vous avez déjà un compte ?{' '}
                <button onClick={() => openDrawer('login')} className="font-semibold text-secondary hover:underline">
                  Connectez-vous
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
