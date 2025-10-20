import React, { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http, setToken } from '../api/http'

type Prompt = { id: string; name: string; body: string }

export default function Prompts(){
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: async ()=> (await http.get('/api/prompts')).data.data as Prompt[]
  })

  // Auth
  const [authMode, setAuthMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const register = useMutation({
    mutationFn: async (p:{email:string; password:string}) => (await http.post('/api/register', p)).data,
    onSuccess: ()=> alert('registered')
  })
  const login = useMutation({
    mutationFn: async (p:{email:string; password:string}) => (await http.post('/api/login', p)).data,
    onSuccess: (d:any)=> { setToken(d.data.token); alert('logged in') }
  })

  // Create
  const create = useMutation({
    mutationFn: async (p:{name:string; body:string; tags:string[]}) =>
      (await http.post('/api/prompts', p)).data.data,
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ['prompts'] })
  })
  // Update
  const update = useMutation({
    mutationFn: async (p:Prompt) =>
      (await http.put(`/api/prompts/${p.id}`, { name:p.name, body:p.body, tags:[] })).data.data,
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ['prompts'] })
  })
  // Delete
  const remove = useMutation({
    mutationFn: async (id:string) => (await http.delete(`/api/prompts/${id}`)).data.data,
    onSuccess: ()=> qc.invalidateQueries({ queryKey: ['prompts'] })
  })

  // 新建表单
  const [name, setName] = useState('')
  const [body, setBody] = useState('')

  // 编辑态
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editBody, setEditBody] = useState('')

  const list = useMemo(()=> data ?? [], [data])

  return (
    <div style={{maxWidth: 880, margin: '40px auto', fontFamily:'system-ui'}}>
      <h2 style={{marginBottom:8}}>Prompts</h2>

      {/* Auth */}
      <div style={{display:'flex', gap:8, margin:'12px 0', alignItems:'center'}}>
        <select value={authMode} onChange={e=>setAuthMode(e.target.value as any)}>
          <option value="login">Login</option>
          <option value="register">Register</option>
        </select>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button onClick={()=> authMode==='login' ? login.mutate({email,password}) : register.mutate({email,password})}>
          {authMode==='login' ? (login.isPending?'Logging in...':'Login') : (register.isPending?'Registering...':'Register')}
        </button>
      </div>

      {/* 新建 */}
      <div style={{display:'flex', gap:8, margin:'12px 0'}}>
        <input placeholder="name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="body" value={body} onChange={e=>setBody(e.target.value)} />
        <button onClick={()=> create.mutate({name, body, tags:[]})} disabled={create.isPending}>
          {create.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>

      {/* 列表 */}
      {isLoading ? 'loading...' : (
        <table width="100%" cellPadding={8} style={{borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left', color:'#666'}}>
              <th style={{width: '28%'}}>Name</th>
              <th>Body</th>
              <th style={{width: 220}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id} style={{borderTop:'1px solid #eee'}}>
                <td>
                  {editingId===p.id
                    ? <input value={editName} onChange={e=>setEditName(e.target.value)} />
                    : <b>{p.name}</b>}
                </td>
                <td>
                  {editingId===p.id
                    ? <input value={editBody} onChange={e=>setEditBody(e.target.value)} />
                    : <span>{p.body}</span>}
                </td>
                <td>
                  {editingId===p.id ? (
                    <>
                      <button
                        onClick={()=> update.mutate({ id:p.id, name:editName, body:editBody })}
                        disabled={update.isPending}
                        style={{marginRight:8}}
                      >{update.isPending?'Saving...':'Save'}</button>
                      <button onClick={()=> setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={()=> { setEditingId(p.id); setEditName(p.name); setEditBody(p.body) }}
                        style={{marginRight:8}}
                      >Edit</button>
                      <button
                        onClick={()=> remove.mutate(p.id)}
                        disabled={remove.isPending}
                        style={{color:'#b91c1c'}}
                      >{remove.isPending?'Deleting...':'Delete'}</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {list.length===0 && (
              <tr><td colSpan={3} style={{padding:16, color:'#888'}}>No data</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}