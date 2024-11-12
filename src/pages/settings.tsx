// src/pages/TelaConfiguracoes.tsx

'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import { User } from 'firebase/auth'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
} from 'firebase/auth'
import {
  Moon,
  Sun,
  User as UserIcon,
  Camera,
  Mail,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/db/firebase' // Assegure-se de exportar 'storage' do seu arquivo de configuração Firebase

const TelaConfiguracoes: React.FC = () => {
  const auth = getAuth()
  const [user, setUser] = useState<User | null>(null)
  const [modoEscuro, setModoEscuro] = useState<boolean>(false)
  const [novoEmail, setNovoEmail] = useState<string>('')
  const [novaSenha, setNovaSenha] = useState<string>('')
  const [foto, setFoto] = useState<File | null>(null)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState<boolean>(false)
  const [isUpdatingSenha, setIsUpdatingSenha] = useState<boolean>(false)
  const [isUpdatingFoto, setIsUpdatingFoto] = useState<boolean>(false)
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false)

  // Carregar preferência de tema do localStorage
  useEffect(() => {
    const tema = localStorage.getItem('modoEscuro')
    if (tema === 'true') {
      setModoEscuro(true)
      document.documentElement.classList.add('dark')
    } else {
      setModoEscuro(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Listener de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [auth])

  // Função para alternar o modo escuro
  const toggleModoEscuro = () => {
    const novoModo = !modoEscuro
    setModoEscuro(novoModo)
    if (novoModo) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('modoEscuro', String(novoModo))
  }

  // Função para atualizar a foto de perfil
  const atualizarFoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user) {
      setFoto(file)
      setIsUpdatingFoto(true)
      try {
        const storageRef = ref(storage, `usuarios/${user.uid}/perfil/${file.name}`)
        await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(storageRef)
        await updateProfile(user, { photoURL: downloadURL })
        toast.success('Foto de perfil atualizada com sucesso!')
      } catch (error) {
        console.error('Erro ao atualizar a foto:', error)
        toast.error('Erro ao atualizar a foto de perfil.')
      } finally {
        setIsUpdatingFoto(false)
      }
    }
  }

  // Função para atualizar o e-mail
  const atualizarEmailUsuario = async () => {
    if (user && novoEmail) {
      setIsUpdatingEmail(true)
      try {
        await updateEmail(user, novoEmail)
        toast.success('E-mail atualizado com sucesso!')
        setNovoEmail('')
      } catch (error: any) {
        console.error('Erro ao atualizar o e-mail:', error)
        toast.error(error.message || 'Erro ao atualizar o e-mail.')
      } finally {
        setIsUpdatingEmail(false)
      }
    } else {
      toast.error('Por favor, insira um novo e-mail válido.')
    }
  }

  // Função para atualizar a senha
  const atualizarSenhaUsuario = async () => {
    if (user && novaSenha) {
      setIsUpdatingSenha(true)
      try {
        await updatePassword(user, novaSenha)
        toast.success('Senha atualizada com sucesso!')
        setNovaSenha('')
      } catch (error: any) {
        console.error('Erro ao atualizar a senha:', error)
        toast.error(error.message || 'Erro ao atualizar a senha.')
      } finally {
        setIsUpdatingSenha(false)
      }
    } else {
      toast.error('Por favor, insira uma nova senha válida.')
    }
  }

  // Função para sair da conta
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut(auth)
      toast.success('Você saiu da sua conta com sucesso.')
    } catch (error) {
      console.error('Erro ao sair:', error)
      toast.error('Erro ao sair da conta.')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center ${modoEscuro ? 'dark' : ''} bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto bg-zinc-50 dark:bg-zinc-800 shadow-lg rounded-lg">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-2xl font-bold">Configurações da Conta</CardTitle>
            <CardDescription className="text-center">Gerencie suas informações e preferências</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Perfil do Usuário */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-24 h-24 text-zinc-500" />
                )}
                <Label
                  htmlFor="foto-upload"
                  className="absolute bottom-0 right-0 bg-zinc-200 dark:bg-zinc-600 rounded-full p-2 cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-500 transition-colors duration-200"
                >
                  <Camera className="w-4 h-4 text-zinc-700 dark:text-zinc-200" />
                  <Input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={atualizarFoto}
                  />
                </Label>
                {isUpdatingFoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <svg
                      className="animate-spin h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold">{user?.displayName || 'Usuário'}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</p>
              </div>
            </div>

            {/* Atualização de E-mail */}
            <div>
              <Label htmlFor="new-email" className="flex items-center space-x-2 mb-1">
                <Mail className="w-4 h-4" />
                <span>Novo E-mail</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="new-email"
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="novo@email.com"
                  className="flex-1"
                />
                <Button
                  onClick={atualizarEmailUsuario}
                  disabled={isUpdatingEmail}
                  className="flex items-center space-x-2"
                >
                  {isUpdatingEmail ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  ) : (
                    <span>Atualizar</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Atualização de Senha */}
            <div>
              <Label htmlFor="new-password" className="flex items-center space-x-2 mb-1">
                <Lock className="w-4 h-4" />
                <span>Nova Senha</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="new-password"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="flex-1"
                />
                <Button
                  onClick={atualizarSenhaUsuario}
                  disabled={isUpdatingSenha}
                  className="flex items-center space-x-2"
                >
                  {isUpdatingSenha ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  ) : (
                    <span>Atualizar</span>
                  )}
                </Button>
              </div>
            </div>

            {/* Modo Escuro */}
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex items-center space-x-2">
                {modoEscuro ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
                <span>Mudar para {modoEscuro ? 'Modo Claro' : 'Modo Escuro'}</span>
              </Label>
              <Switch
                id="dark-mode"
                checked={modoEscuro}
                onCheckedChange={toggleModoEscuro}
              />
            </div>
          </CardContent>
          <CardHeader className="px-6">
            <CardDescription className="text-center">
              Gerencie suas preferências e mantenha sua conta segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full flex items-center justify-center space-x-2"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
              <span>Sair da Conta</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TelaConfiguracoes
