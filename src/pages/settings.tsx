// src/pages/TelaConfiguracoes.tsx

'use client'

import React, { useState, useEffect, ChangeEvent } from 'react'
import { User } from 'firebase/auth'
import {
  onAuthStateChanged,
  signOut,
  updateProfile
} from 'firebase/auth'
import {
  User as UserIcon, PictureInPicture
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
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, storage } from '@/db/firebase'; // Assegure-se de exportar 'storage' do seu arquivo de configuração Firebase
// import { useAuth } from '@/contexts/auth-context'

const TelaConfiguracoes: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  // const [novoEmail, setNovoEmail] = useState<string>('')
  // const [novaSenha, setNovaSenha] = useState<string>('')
  // const [isUpdatingEmail, setIsUpdatingEmail] = useState<boolean>(false)
  // const [isUpdatingSenha, setIsUpdatingSenha] = useState<boolean>(false)
  const [isUpdatingFoto, setIsUpdatingFoto] = useState<boolean>(false)
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false)
  // const { currentUser } = useAuth()



  // Listener de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()
  }, [auth])

  // Função para alternar o modo escuro


  // Função para atualizar a foto de perfil
  const atualizarFoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user) {
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

  // // Função para atualizar o e-mail
  // const atualizarEmailUsuario = async () => {
  //   if (user && novoEmail) {
  //     setIsUpdatingEmail(true)
  //     try {
  //       await updateEmail(user, novoEmail)
  //       toast.success('E-mail atualizado com sucesso!')
  //       setNovoEmail('')
  //     } catch (error: any) {
  //       console.error('Erro ao atualizar o e-mail:', error)
  //       toast.error(error.message || 'Erro ao atualizar o e-mail.')
  //     } finally {
  //       setIsUpdatingEmail(false)
  //     }
  //   } else {
  //     toast.error('Por favor, insira um novo e-mail válido.')
  //   }
  // }

  // Função para atualizar a senha
  // const atualizarSenhaUsuario = async () => {
  //   if (user && novaSenha) {
  //     setIsUpdatingSenha(true)
  //     try {
  //       await updatePassword(user, novaSenha)
  //       toast.success('Senha atualizada com sucesso!')
  //       setNovaSenha('')
  //     } catch (error: any) {
  //       console.error('Erro ao atualizar a senha:', error)
  //       toast.error(error.message || 'Erro ao atualizar a senha.')
  //     } finally {
  //       setIsUpdatingSenha(false)
  //     }
  //   } else {
  //     toast.error('Por favor, insira uma nova senha válida.')
  //   }
  // }

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
    <div className={`min-h-screen flex items-center `}>
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-lg">
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
                    className="w-24 h-24 rounded-full object-cover cursor-pointer "
                  />
                ) : (
                  <UserIcon className="w-24 h-24 text-zinc-500" />
                )}
                <Label
                  htmlFor="foto-upload"
                  className="absolute bottom-0 right-0  transition-colors duration-200 cursor-pointer"
                >
                  <PictureInPicture className="w-6 h-6 text-white bg-zinc-900/50 p-1 rounded-full " />
                  <Input
                    id="foto-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={atualizarFoto}
                  />
                </Label>
                {isUpdatingFoto && (
                  <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 rounded-full">
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

            {/* Atualização de E-mail 
            <div className='space-y-1'>
              <Label htmlFor="new-email" >
                <span>E-mail</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="new-email"
                  type="email"
                  value={novoEmail}
                  defaultValue={currentUser?.email as string}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="novo@email.com"
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
*/}
            {/* Atualização de Senha 
            <div className='space-y-1'>
              <Label htmlFor="new-password" >
                <span>Senha</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="new-password"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
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
            */}
            <div className='w-full flex justify-center items-center'>
              <Button
                variant="destructive"
                className="flex items-center justify-center space-x-2 w-[170px]"
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
            </div>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}

export default TelaConfiguracoes
