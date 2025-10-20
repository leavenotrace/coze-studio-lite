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

  // fetch current user
  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await http.get('/api/me')).data.data as { id:string; email:string },
    retry: false,
    enabled: true,
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
  <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Prompts</h2>
          <div className="text-sm text-gray-500">Create and manage prompt templates</div>
        </div>

        <div className="flex items-center gap-3">
          {meData ? (
            <div className="flex items-center gap-3 ml-3">
              <div className="text-sm">{meData.email}</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>{ setToken(null); qc.invalidateQueries(); alert('logged out') }}>Logout</button>
            </div>
          ) : (
            <div className="text-sm text-gray-500">请先登录以使用写操作。可在顶部导航点击 Login / Register。</div>
          )}
        </div>
      </div>

      {/* 新建 */}
      <div className="flex gap-3 items-center mb-4">
        <input placeholder="name" value={name} onChange={e=>setName(e.target.value)} className="input input-bordered w-72" />
        <input placeholder="body" value={body} onChange={e=>setBody(e.target.value)} className="input input-bordered flex-1" />
        <button className="btn btn-primary" onClick={()=> create.mutate({name, body, tags:[]})} disabled={create.isPending}>{create.isPending ? 'Creating...' : 'Create'}</button>
      </div>

      {/* 列表 */}
      {isLoading ? <div className="p-4">loading...</div> : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Body</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td>
                    {editingId===p.id
                      ? <input value={editName} onChange={e=>setEditName(e.target.value)} className="input input-bordered" />
                      : <b>{p.name}</b>}
                  </td>
                  <td>
                    {editingId===p.id
                      ? <input value={editBody} onChange={e=>setEditBody(e.target.value)} className="input input-bordered" />
                      : <span>{p.body}</span>}
                  </td>
                  <td className="w-56">
                    <div className="flex gap-2">
                    {editingId===p.id ? (
                      <>
                        <button
                          onClick={()=> update.mutate({ id:p.id, name:editName, body:editBody })}
                          disabled={update.isPending}
                          className="btn btn-sm"
                        >{update.isPending?'Saving...':'Save'}</button>
                        <button className="btn btn-sm btn-ghost" onClick={()=> setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={()=> { setEditingId(p.id); setEditName(p.name); setEditBody(p.body) }}
                          className="btn btn-sm btn-outline"
                        >Edit</button>
                        <button
                          onClick={()=> remove.mutate(p.id)}
                          disabled={remove.isPending}
                          className="btn btn-sm btn-error"
                        >{remove.isPending?'Deleting...':'Delete'}</button>
                      </>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
              {list.length===0 && (
                <tr><td colSpan={3} className="p-4 text-gray-500">No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}