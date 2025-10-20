import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http, setToken } from '../api/http'

export default function Login(){
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useMutation({
    mutationFn: async (p:{email:string; password:string}) => (await http.post('/api/login', p)).data,
    onSuccess: (d:any)=> { setToken(d.data.token); qc.invalidateQueries(); alert('登录成功') }
  })

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">登录</h2>
      <div className="flex flex-col gap-3">
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="input input-bordered" />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} className="input input-bordered" />
        <button className="btn btn-primary" onClick={()=> login.mutate({email,password})} disabled={login.isPending}>{login.isPending ? '登录中...' : '登录'}</button>
      </div>
    </div>
  )
}
