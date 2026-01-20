# 🚀 QUICK START GUIDE

## Step 1: Check the Database

The required tables have already been created by `SUPABASE_SETUP.sql`:
- ✅ `ativos` - Asset registration
- ✅ `atribuicoes` - Assignments with embedded audit fields

Verify they exist:
```sql
-- View atribuicoes table structure
SELECT * FROM public.atribuicoes LIMIT 1;

-- Check audit fields
SELECT ip_usuario, user_agent, data_aceite, versao_termo 
FROM public.atribuicoes 
WHERE status_aceite = 'ACEITO' 
LIMIT 5;
```

> **NOTE**: No need to run `LOGS_AUDITORIA_SETUP.sql` - the `atribuicoes` table already has audit fields (`ip_usuario`, `user_agent`, `data_aceite`, `versao_termo`).

---

## Step 2: Test the APIs

### Test in Browser Console

1. Open the project in browser
2. Open Console (F12)
3. Paste and execute:

```javascript
// Import service (if in correct context)
// Or test directly in components

// Test 1: Get pending assets
const teste1 = async () => {
  const { getMeusAtivosPendentes } = await import('./lib/ativosService')
  const resultado = await getMeusAtivosPendentes(1)
  console.log('Ativos pendentes:', resultado)
}
teste1()

// Test 2: Confirm acceptance
const teste2 = async () => {
  const { confirmarAceite } = await import('./lib/ativosService')
  const resultado = await confirmarAceite([3, 5], 1)
  console.log('Resultado do aceite:', resultado)
}
teste2()
```

---

## Step 3: Use in Code

### Example 1: In a Component

```jsx
import { getMeusAtivosPendentes, confirmarAceite } from '../lib/ativosService'

function MeuComponente() {
  const [pendentes, setPendentes] = useState([])

  useEffect(() => {
    const carregar = async () => {
      const resultado = await getMeusAtivosPendentes(usuarioId)
      if (resultado.success) {
        setPendentes(resultado.data)
      }
    }
    carregar()
  }, [])

  const handleAceitar = async () => {
    const ids = pendentes.map(p => p.id)
    const resultado = await confirmarAceite(ids, usuarioId)
    if (resultado.success) {
      alert('Ativos aceitos!')
    }
  }

  return (
    <div>
      <h2>Pendentes: {pendentes.length}</h2>
      <button onClick={handleAceitar}>Aceitar Todos</button>
    </div>
  )
}
```

### Example 2: Already Implemented

The `ModalAtivosP.jsx` and `Patrimonio.jsx` components are already using the new APIs! ✅

---

## Step 4: Monitor Audit Logs

### View audit data in `atribuicoes` table:

```sql
-- Last 10 acceptances with audit data
SELECT 
  a.id,
  a.usuario_id,
  a.data_aceite,
  a.ip_usuario,
  a.user_agent,
  a.versao_termo,
  at.tipo,
  at.modelo
FROM public.atribuicoes a
JOIN public.ativos at ON a.ativo_id = at.id
WHERE a.status_aceite = 'ACEITO'
ORDER BY a.data_aceite DESC 
LIMIT 10;

-- Acceptances by user
SELECT usuario_id, COUNT(*) as total_aceites
FROM public.atribuicoes
WHERE status_aceite = 'ACEITO'
GROUP BY usuario_id;

-- Analysis by IP
SELECT ip_usuario, COUNT(*) as total
FROM public.atribuicoes
WHERE status_aceite = 'ACEITO'
GROUP BY ip_usuario;
```

---

## ✅ Verification Checklist

- [ ] `ativos` and `atribuicoes` tables exist in Supabase
- [ ] Audit fields verified (ip_usuario, user_agent, data_aceite)
- [ ] APIs tested in console
- [ ] Components updated
- [ ] No errors in console
- [ ] Audit data being saved correctly

---

## 🆘 Common Problems

### Error: "Table not found"
**Solution**: Run the `SUPABASE_SETUP.sql` script to create the `ativos` and `atribuicoes` tables

### Error: "Permission denied"
**Solution**: Check RLS policies in Supabase

### Error: "Invalid IDs"
**Solution**: Make sure the atribuicoes IDs exist

---

## 🎉 Done!

Now you can:
- ✅ Get pending assets
- ✅ Confirm acceptance with validation
- ✅ Register audit logs
- ✅ Monitor all actions

**Everything working!** 🚀
