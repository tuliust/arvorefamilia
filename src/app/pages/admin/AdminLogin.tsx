import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Painel administrativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            O acesso administrativo usa o login seguro do Supabase. Entre com a conta autorizada para continuar.
          </p>
          <Button className="w-full" onClick={() => navigate('/entrar')}>
            Entrar com e-mail e senha
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
