import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { User } from '@supabase/supabase-js';
import { ArrowRight, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { PublicFooterLinks, PublicInlineLink, PublicThemeFrame } from '../components/public/PublicThemeFrame';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useSiteVisualSettings } from '../hooks/useSiteVisualSettings';
import { supabase } from '../lib/supabaseClient';
import {
  ensureMemberProfile,
  FirstAccessPersonPreview,
  isPersonAlreadyLinked,
  resolveFirstAccessLinkForUser,
  storePendingFirstAccess,
  validateFirstAccessCode,
} from '../services/memberProfileService';

type AuthMode = 'login' | 'first-access';
type FirstAccessStep = 'code' | 'account' | 'confirmation';

const RECENT_LOGIN_LIMIT_MS = 60 * 60 * 1000;
const RESEND_CONFIRMATION_COOLDOWN_SECONDS = 60;
const MOBILE_DESKTOP_TIP_SESSION_KEY = 'arvore-mobile-desktop-tip-dismissed';
const MOBILE_DESKTOP_TIP_PENDING_KEY = 'arvore-mobile-desktop-tip-pending';

function getEmailRedirectTo() {
  return `${window.location.origin}/entrar`;
}

function hasRecentLogin(lastSignInAt?: string | null) {
  if (!lastSignInAt) return false;

  const lastSignInTime = new Date(lastSignInAt).getTime();
  if (!Number.isFinite(lastSignInTime)) return false;

  return Date.now() - lastSignInTime <= RECENT_LOGIN_LIMIT_MS;
}

function isEmailNotConfirmedError(message: string) {
  const lower = message.toLowerCase();
  return lower.includes('email not confirmed') || lower.includes('email_not_confirmed');
}

function getCooldownFromAuthMessage(message: string) {
  const match = message.match(/after\s+(\d+)\s+seconds/i);
  return match ? Number(match[1]) : null;
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();

  if (isEmailNotConfirmedError(message)) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e o spam antes de tentar entrar.';
  }

  if (lower.includes('invalid login credentials')) {
    return 'E-mail ou senha inválidos.';
  }

  if (lower.includes('password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }

  if (lower.includes('already registered') || lower.includes('user already registered')) {
    return 'Este e-mail já está cadastrado. Faça login para continuar.';
  }

  return message;
}

function shouldQueueMobileDesktopTip() {
  if (typeof window === 'undefined') return false;
  if (window.sessionStorage.getItem(MOBILE_DESKTOP_TIP_SESSION_KEY) === 'true') return false;
  return window.matchMedia('(max-width: 767px)').matches;
}

export function Entrar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { settings: siteVisualSettings, loading: siteVisualSettingsLoading } = useSiteVisualSettings();
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstAccessStep, setFirstAccessStep] = useState<FirstAccessStep>('code');
  const [accessCode, setAccessCode] = useState('');
  const [preview, setPreview] = useState<FirstAccessPersonPreview | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirmation, setSignupPasswordConfirmation] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupPasswordConfirmation, setShowSignupPasswordConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendSubmitting, setResendSubmitting] = useState(false);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const [checkingSession, setCheckingSession] = useState(true);
  const [acceptedLegalTerms, setAcceptedLegalTerms] = useState(false);

  useEffect(() => {
    if (siteVisualSettingsLoading) return;

    document.title = siteVisualSettings.seo_title;

    let descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.name = 'description';
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.content = siteVisualSettings.seo_description;
  }, [siteVisualSettings.seo_description, siteVisualSettings.seo_title, siteVisualSettingsLoading]);

  useEffect(() => {
    let mounted = true;

    async function redirectAuthenticatedUser() {
      if (loading) return;

      if (!user) {
        setCheckingSession(false);
        return;
      }

      if (!hasRecentLogin(user.last_sign_in_at)) {
        setLoginEmail(user.email || '');
        setCheckingSession(false);
        return;
      }

      setCheckingSession(true);
      const result = await resolveFirstAccessLinkForUser(user);

      if (!mounted) return;

      if (result.status === 'linked') {
        navigateAfterOptionalMobileTip(result.data.dados_confirmados ? '/' : '/meus-dados');
      } else {
        setCheckingSession(false);
      }
    }

    void redirectAuthenticatedUser();

    return () => {
      mounted = false;
    };
  }, [loading, user]);

  useEffect(() => {
    if (resendCooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldownSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldownSeconds]);

  const startResendCooldown = useCallback((seconds = RESEND_CONFIRMATION_COOLDOWN_SECONDS) => {
    setResendCooldownSeconds(Math.max(0, seconds));
  }, []);

  const title = useMemo(() => {
    if (firstAccessStep === 'confirmation') return siteVisualSettings.entrance_confirmation_title;
    if (mode === 'login') return siteVisualSettings.entrance_login_title;
    if (firstAccessStep === 'code') return siteVisualSettings.entrance_first_access_title;
    return 'Criar conta';
  }, [firstAccessStep, mode, siteVisualSettings]);

  const cardDescription = useMemo(() => {
    if (mode === 'login') {
      return firstAccessStep === 'confirmation'
        ? siteVisualSettings.entrance_confirmation_description
        : siteVisualSettings.entrance_login_description;
    }

    return siteVisualSettings.entrance_first_access_description;
  }, [firstAccessStep, mode, siteVisualSettings]);

  const primaryButtonStyle = useMemo(() => ({
    backgroundColor: siteVisualSettings.global_primary_color,
    borderRadius: siteVisualSettings.global_button_radius,
  }), [siteVisualSettings.global_button_radius, siteVisualSettings.global_primary_color]);

  const routeAfterAuth = async (authUser: User) => {
    const result = await resolveFirstAccessLinkForUser(authUser);

    if (result.status === 'error') {
      toast.error(result.error);
      return;
    }

    if (result.status === 'person-already-linked') {
      toast.error('Este código já foi utilizado por outra conta.');
      return;
    }

    if (result.status === 'person-not-found') {
      toast.error('O código de primeiro acesso salvo não corresponde a uma pessoa da árvore.');
      return;
    }

    if (result.status === 'missing-pessoa-id') {
      toast.error('Sua conta ainda não está vinculada a uma pessoa da árvore. Faça o primeiro acesso novamente usando seu código ou solicite ajuda.');
      return;
    }

    if (result.created) {
      toast.success('Vínculo criado. Revise seus dados para continuar.');
    }

    navigateAfterOptionalMobileTip(result.data.dados_confirmados ? '/' : '/meus-dados');
  };

  const navigateAfterOptionalMobileTip = (path: string) => {
    if (shouldQueueMobileDesktopTip()) {
      window.sessionStorage.setItem(MOBILE_DESKTOP_TIP_PENDING_KEY, 'true');
    }

    navigate(path, { replace: true });
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedEmail = loginEmail.trim().toLowerCase();

    if (!normalizedEmail || !loginPassword) {
      toast.error('Informe e-mail e senha.');
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: loginPassword,
    });
    setSubmitting(false);

    if (error) {
      if (isEmailNotConfirmedError(error.message)) {
        setConfirmationEmail(normalizedEmail);
        setLoginEmail(normalizedEmail);
        setMode('login');
        setFirstAccessStep('confirmation');
        startResendCooldown();
      }

      toast.error(friendlyAuthError(error.message));
      return;
    }

    if (!data.user) {
      toast.error('Não foi possível identificar o usuário autenticado.');
      return;
    }

    await routeAfterAuth(data.user);
  };

  const handleResetPassword = async () => {
    const normalizedEmail = loginEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error('Informe seu e-mail para recuperar a senha.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/entrar`,
    });
    setSubmitting(false);

    if (error) {
      toast.error(friendlyAuthError(error.message));
      return;
    }

    toast.success('Enviamos um e-mail com instruções para recuperar sua senha.');
  };

  const handleValidateCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const { data, error } = await validateFirstAccessCode(accessCode);
    setSubmitting(false);

    if (error) {
      toast.error(error);
      return;
    }

    if (!data) {
      toast.error('Código não encontrado. Verifique o código informado.');
      return;
    }

    if (data.already_used) {
      toast.error('Este código já foi utilizado. Faça login ou solicite ajuda.');
      return;
    }

    setAcceptedLegalTerms(false);
    setPreview(data);
    setFirstAccessStep('account');
  };

  const handleCreateAccount = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!preview) {
      toast.error('Valide o código de primeiro acesso antes de criar a conta.');
      setFirstAccessStep('code');
      return;
    }

    const normalizedEmail = signupEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error('E-mail é obrigatório.');
      return;
    }

    if (!signupPassword) {
      toast.error('Senha é obrigatória.');
      return;
    }

    if (!signupPasswordConfirmation) {
      toast.error('Confirmação de senha é obrigatória.');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (signupPassword !== signupPasswordConfirmation) {
      toast.error('Senha e confirmação devem ser iguais.');
      return;
    }

    if (!acceptedLegalTerms) {
      toast.error('Você precisa aceitar os termos de uso e a política de privacidade para criar a conta.');
      return;
    }

    setSubmitting(true);

    const linkedCheck = await isPersonAlreadyLinked(preview.pessoa_id);
    if (linkedCheck.error) {
      setSubmitting(false);
      toast.error(linkedCheck.error);
      return;
    }

    if (linkedCheck.alreadyLinked) {
      setSubmitting(false);
      toast.error('Este código já foi utilizado. Faça login ou solicite ajuda.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: signupPassword,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
        data: {
          nome_exibicao: preview.nome_completo,
          pessoa_id: preview.pessoa_id,
          primeiro_acesso: true,
        },
      },
    });

    if (error) {
      setSubmitting(false);
      toast.error(friendlyAuthError(error.message));
      return;
    }

    if (!data.user) {
      setSubmitting(false);
      toast.error('Não foi possível criar o usuário.');
      return;
    }

    storePendingFirstAccess(preview.pessoa_id, normalizedEmail);

    if (!data.session) {
      setSubmitting(false);
      setConfirmationEmail(normalizedEmail);
      setFirstAccessStep('confirmation');
      setMode('login');
      startResendCooldown();
      return;
    }

    const profileResult = await ensureMemberProfile(data.user.id, {
      nome_exibicao: preview.nome_completo,
    });

    if (profileResult.error) {
      setSubmitting(false);
      toast.error(profileResult.error);
      return;
    }

    const linkResult = await resolveFirstAccessLinkForUser(data.user);

    setSubmitting(false);

    if (linkResult.status === 'error') {
      toast.error(linkResult.error);
      return;
    }

    if (linkResult.status === 'person-already-linked') {
      toast.error('Este código já foi utilizado por outra conta.');
      return;
    }

    if (linkResult.status !== 'linked') {
      toast.error('Não foi possível criar o vínculo com a pessoa da árvore.');
      return;
    }

    toast.success('Conta criada. Revise seus dados para acessar a árvore.');
    navigateAfterOptionalMobileTip('/meus-dados');
  };

  const handleResendConfirmation = async () => {
    const normalizedEmail = confirmationEmail.trim().toLowerCase();

    if (resendCooldownSeconds > 0) {
      toast.info(`Aguarde ${resendCooldownSeconds}s para reenviar o e-mail.`);
      return;
    }

    if (!normalizedEmail) {
      toast.error('Não foi possível identificar o e-mail para reenvio.');
      return;
    }

    setResendSubmitting(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });
    setResendSubmitting(false);

    if (error) {
      const cooldown = getCooldownFromAuthMessage(error.message);
      if (cooldown !== null) {
        startResendCooldown(cooldown);
        toast.info(`Aguarde ${cooldown}s para reenviar o e-mail.`);
        return;
      }

      toast.error(friendlyAuthError(error.message));
      return;
    }

    setConfirmationEmail(normalizedEmail);
    startResendCooldown();
    toast.success('E-mail de confirmação reenviado.');
  };

  const showLogin = () => {
    setMode('login');
  };

  const showFirstAccess = () => {
    setMode('first-access');
    if (firstAccessStep === 'confirmation') {
      setFirstAccessStep('code');
      setAcceptedLegalTerms(false);
    }
  };

  const resetFirstAccessCodeStep = () => {
    setFirstAccessStep('code');
    setPreview(null);
    setAcceptedLegalTerms(false);
  };

  if (loading || checkingSession || siteVisualSettingsLoading) {
    return (
      <PublicEntranceLoading
        label={siteVisualSettingsLoading ? 'Carregando configurações...' : 'Verificando sessão...'}
      />
    );
  }

  const logoMediaUrl = siteVisualSettings.home_logo_media_url || '/favicon.svg';

  return (
    <PublicThemeFrame settings={siteVisualSettings} className="flex flex-col">
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(380px,1fr)]">
          <section className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
            <img
              src={logoMediaUrl}
              alt={siteVisualSettings.home_logo_alt_text}
              className="mb-6 h-auto w-24 max-w-full object-contain sm:w-28 lg:w-32"
            />
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: siteVisualSettings.global_primary_color }}>
              {siteVisualSettings.entrance_eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight" style={{ color: siteVisualSettings.global_text_color }}>
              {siteVisualSettings.entrance_title}
            </h1>
            <div className="mt-4 max-w-xl space-y-3 text-base leading-7" style={{ color: siteVisualSettings.global_muted_text_color }}>
              <p>{siteVisualSettings.entrance_description}</p>
            </div>
          </section>

          <Card className="border-gray-200 shadow-xl" style={{ backgroundColor: siteVisualSettings.global_card_background_color, borderRadius: siteVisualSettings.global_card_radius }}>
            <CardHeader className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                <ModeButton active={mode === 'login'} onClick={showLogin} activeColor={siteVisualSettings.global_primary_color}>
                  <LogIn className="h-4 w-4" />
                  Login
                </ModeButton>
                <ModeButton active={mode === 'first-access'} onClick={showFirstAccess} activeColor={siteVisualSettings.global_primary_color}>
                  <UserPlus className="h-4 w-4" />
                  Primeiro acesso
                </ModeButton>
              </div>

              <div>
                <CardTitle className="text-2xl" style={{ color: siteVisualSettings.global_text_color }}>{title}</CardTitle>
                <p className="mt-2 text-sm" style={{ color: siteVisualSettings.global_muted_text_color }}>
                  {cardDescription}
                </p>
              </div>
            </CardHeader>

            <CardContent>
              {mode === 'login' && firstAccessStep === 'confirmation' ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-950">Cadastro iniciado com sucesso.</p>
                    <p className="mt-2 text-sm text-green-800">
                      Enviamos um e-mail de confirmação para:
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-green-950">
                      {confirmationEmail || 'e-mail cadastrado'}
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-green-800">
                      <p>Confira sua caixa de entrada e também a pasta de spam ou lixo eletrônico.</p>
                      <p>Depois de confirmar o e-mail, volte para esta página e faça login.</p>
                      <p>
                        Se o e-mail estiver incorreto, solicite ajuda ao administrador para remover o cadastro pendente e refazer o primeiro acesso.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={resendSubmitting || resendCooldownSeconds > 0}
                    onClick={handleResendConfirmation}
                    style={{ borderRadius: siteVisualSettings.global_button_radius }}
                  >
                    {resendSubmitting
                      ? 'Reenviando...'
                      : resendCooldownSeconds > 0
                        ? `Reenviar e-mail em ${resendCooldownSeconds}s`
                        : 'Reenviar e-mail de confirmação'}
                  </Button>

                  <Button
                    type="button"
                    className="w-full"
                    style={primaryButtonStyle}
                    onClick={() => {
                      const normalizedEmail = confirmationEmail.trim().toLowerCase();
                      resetFirstAccessCodeStep();
                      setMode('login');
                      if (normalizedEmail) {
                        setLoginEmail(normalizedEmail);
                      }
                    }}
                  >
                    Ir para login
                  </Button>
                </div>
              ) : mode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                  <Field label="E-mail">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} className="pl-10" required data-testid="login-email" />
                    </div>
                  </Field>

                  <Field label="Senha">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(event) => setLoginPassword(event.target.value)}
                        className="pl-10 pr-10"
                        required
                        data-testid="login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((current) => !current)}
                        className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label={showLoginPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <Button type="submit" className="w-full" disabled={submitting} data-testid="login-submit" style={primaryButtonStyle}>
                    {submitting ? 'Entrando...' : siteVisualSettings.entrance_login_cta_label}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={submitting}
                    className="w-full text-center text-sm font-medium hover:underline disabled:opacity-60"
                    style={{ color: siteVisualSettings.global_muted_text_color }}
                  >
                    {siteVisualSettings.entrance_forgot_password_label}
                  </button>

                  <button
                    type="button"
                    onClick={showFirstAccess}
                    className="w-full text-center text-sm font-medium hover:underline"
                    style={{ color: siteVisualSettings.global_primary_color }}
                  >
                    Primeiro acesso
                  </button>
                </form>
              ) : firstAccessStep === 'code' ? (
                <form onSubmit={handleValidateCode} className="space-y-4">
                  <Field label="Código de primeiro acesso">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={accessCode}
                        onChange={(event) => {
                          setAccessCode(event.target.value);
                          setAcceptedLegalTerms(false);
                        }}
                        placeholder="04fe1b51-306b-4b88-8d6d-1d084984f6ec"
                        className="pl-10"
                        required
                      />
                    </div>
                  </Field>

                  <Button type="submit" className="w-full" disabled={submitting} style={primaryButtonStyle}>
                    {submitting ? 'Validando...' : siteVisualSettings.entrance_first_access_cta_label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-950">{preview?.nome_completo}</p>
                    <p className="mt-1 text-xs text-blue-800">
                      {[preview?.data_nascimento, preview?.local_nascimento].filter(Boolean).join(' • ') || 'Pessoa encontrada'}
                    </p>
                  </div>

                  <Field label="E-mail">
                    <Input type="email" value={signupEmail} onChange={(event) => setSignupEmail(event.target.value)} required />
                  </Field>

                  <Field label="Senha">
                    <div className="relative">
                      <Input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword((current) => !current)}
                        className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label={showSignupPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirmar senha">
                    <div className="relative">
                      <Input
                        type={showSignupPasswordConfirmation ? 'text' : 'password'}
                        value={signupPasswordConfirmation}
                        onChange={(event) => setSignupPasswordConfirmation(event.target.value)}
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPasswordConfirmation((current) => !current)}
                        className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-gray-400 transition hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        aria-label={showSignupPasswordConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                      >
                        {showSignupPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-600">
                    <Checkbox
                      checked={acceptedLegalTerms}
                      onCheckedChange={(checked) => setAcceptedLegalTerms(checked === true)}
                      className="mt-1"
                      aria-label="Aceitar termos de uso e política de privacidade"
                    />
                    <span>
                      Li e aceito os{' '}
                      <PublicInlineLink url={siteVisualSettings.public_terms_url} color={siteVisualSettings.global_primary_color}>
                        {siteVisualSettings.public_terms_label}
                      </PublicInlineLink>{' '}
                      e a{' '}
                      <PublicInlineLink url={siteVisualSettings.public_privacy_url} color={siteVisualSettings.global_primary_color}>
                        {siteVisualSettings.public_privacy_label}
                      </PublicInlineLink>
                      .
                    </span>
                  </label>

                  <Button type="submit" className="w-full" disabled={submitting} style={primaryButtonStyle}>
                    {submitting ? 'Criando conta...' : siteVisualSettings.entrance_create_account_cta_label}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooterLinks settings={siteVisualSettings} />
    </PublicThemeFrame>
  );
}


function PublicEntranceLoading({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  activeColor,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeColor: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
        active ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900',
      ].join(' ')}
      style={active ? { color: activeColor } : undefined}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
