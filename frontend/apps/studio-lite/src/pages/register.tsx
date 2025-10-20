import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { http } from '../api/http'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const register = useMutation({
    mutationFn: async (p:{email:string; password:string}) => (await http.post('/api/register', p)).data,
    onSuccess: ()=> alert('注册成功，请登录')
  })

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">注册</h2>
      <div className="flex flex-col gap-3">
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="input input-bordered" />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input input-bordered" />
        <button className="btn btn-primary" onClick={()=> register.mutate({email,password})} disabled={register.isPending}>{register.isPending ? '注册中...' : '注册'}</button>
      </div>
    </div>
  )
}
