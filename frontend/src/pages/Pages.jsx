import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Box, Check, CheckCircle2, CircleAlert, Cloud, Code2, Database, ExternalLink, GitBranch, Layers3, Plus, RefreshCw, Server, ShieldCheck, Trash2, UploadCloud, X } from 'lucide-react'
import { api, validateYaml } from '../services/api.js'
import { ButtonLink, EmptyState, PageHeading } from '../components/CloudStackLayout.jsx'

const DEFAULT_YAML = `AWSTemplateFormatVersion: '2010-09-09'

Description: Standard Web Infrastructure

Parameters:
  EnvironmentName:
    Type: String
    Default: Dev

Resources:
  StandardVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      Tags:
        - Key: Name
          Value: !Sub "\${EnvironmentName}-VPC"

  StandardBucket:
    Type: AWS::S3::Bucket
    Properties:
      Tags:
        - Key: Environment
          Value: !Ref EnvironmentName

Outputs:
  VPCId:
    Value: !Ref StandardVPC`

function useRemoteData(loader, dependencies = []) {
  const [data, setData] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const refresh = async () => {
    setLoading(true)
    try { setData(await loader()); setError('') }
    catch (err) { setError(err.message); setData([]) }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, dependencies)
  return { data, error, loading, refresh, setData }
}

function Alert({ children, type = 'error', onClose }) {
  if (!children) return null
  return <div className={`alert alert-${type}`} role="status">{type === 'error' ? <CircleAlert size={17} /> : <CheckCircle2 size={17} />}<span>{children}</span>{onClose && <button onClick={onClose} aria-label="Dismiss"><X size={16} /></button>}</div>
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

function StatusBadge({ status }) {
  const normalized = (status || 'ACTIVE').toUpperCase()
  const kind = normalized.includes('COMPLETE') || normalized === 'ACTIVE' || normalized === 'SUCCESS' ? 'success' : normalized.includes('PROGRESS') ? 'progress' : 'danger'
  const label = normalized === 'CREATE_COMPLETE' ? 'SUCCESS' : normalized
  return <span className={`status-badge badge-${kind}`}><span />{label.replaceAll('_', ' ')}</span>
}

function AuthShell({ mode, children }) {
  return <div className="auth-shell"><section className="auth-aside"><Link to="/login" className="brand auth-brand"><span className="brand-icon"><Cloud size={22} /></span><span>cloud<span className="brand-accent">stack</span><small>PLATFORM TEMPLATES</small></span></Link><div className="auth-pitch"><span className="auth-kicker">STANDARDIZE THE CLOUD</span><h1>One template.<br />Every environment.</h1><p>Build a consistent infrastructure foundation for Development, Testing, and Production.</p><div className="auth-diagram"><span><Code2 size={17} />Template</span><ArrowRight size={18} /><span><Layers3 size={17} />Dev · Test · Prod</span></div></div><div className="auth-foot">A local academic demo · No AWS connection</div></section><section className="auth-panel"><div className="auth-box">{children}</div><p className="auth-footer">CloudStack · CloudFormation Platform Template Standardization</p></section></div>
}

export function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { onLogin(await api.login(form)); navigate('/') } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <AuthShell><span className="form-eyebrow">WELCOME BACK</span><h2>Sign in to CloudStack</h2><p className="auth-subtitle">Manage your platform templates and deployment simulations.</p><Alert>{error}</Alert><form className="form-stack" onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" autoComplete="current-password" required placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><button className="button button-primary button-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={17} /></button></form><p className="auth-switch">New to CloudStack? <Link to="/register">Create an account</Link></p><div className="demo-credentials"><strong>Demo access</strong><span>admin@cloudstack.local / admin123</span><span>user@cloudstack.local / user123</span></div></AuthShell>
}

export function RegisterPage({ onRegister }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try { onRegister(await api.register(form)); navigate('/') } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <AuthShell><span className="form-eyebrow">GET STARTED</span><h2>Create your account</h2><p className="auth-subtitle">A simple local login for the CloudStack demonstration.</p><Alert>{error}</Alert><form className="form-stack" onSubmit={submit}><label>Full name<input required placeholder="Alex Morgan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Password<input type="password" required minLength="6" placeholder="At least 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></label><button className="button button-primary button-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}<ArrowRight size={17} /></button></form><p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p></AuthShell>
}

export function DashboardPage() {
  const templates = useRemoteData(api.templates)
  const deployments = useRemoteData(api.deployments)
  const successful = deployments.data.filter(d => d.status === 'CREATE_COMPLETE').length
  const stats = [
    { label: 'Total templates', value: templates.data.length, trend: 'Reusable blueprints', icon: Layers3, color: 'blue' },
    { label: 'Active templates', value: templates.data.filter(t => t.status === 'Active').length, trend: 'Ready to validate', icon: Box, color: 'purple' },
    { label: 'Deployments', value: deployments.data.length, trend: 'Simulations recorded', icon: Activity, color: 'orange' },
    { label: 'Successful runs', value: successful, trend: 'CREATE_COMPLETE', icon: CheckCircle2, color: 'green' },
  ]
  return <>
    <PageHeading eyebrow="OVERVIEW" title="Welcome to CloudStack" description="Standardize your cloud foundations across every environment." action={<ButtonLink to="/templates/new"><Plus size={17} /> Create template</ButtonLink>} />
    {(templates.error || deployments.error) && <Alert>{templates.error || deployments.error}</Alert>}
    <div className="stats-grid">{stats.map(({ label, value, trend, icon: Icon, color }) => <article className="stat-card" key={label}><div className={`stat-icon icon-${color}`}><Icon size={19} /></div><div className="stat-value">{templates.loading || deployments.loading ? '—' : value}</div><div className="stat-label">{label}</div><div className="stat-trend"><ArrowUpRight size={14} />{trend}</div></article>)}</div>
    <div className="dashboard-columns">
      <section className="panel"><div className="panel-heading"><div><h2>Recent templates</h2><p>Your latest reusable infrastructure definitions</p></div><Link to="/templates" className="text-link">All templates <ArrowRight size={15} /></Link></div>
        {templates.data.length ? <div className="compact-list">{templates.data.slice(0, 4).map(t => <Link to={`/templates/${t.id}`} className="compact-row" key={t.id}><span className="row-icon"><Code2 size={17} /></span><span className="row-main"><strong>{t.name}</strong><small>{t.environment} · {t.version}</small></span><StatusBadge status={t.status} /><ArrowRight size={15} className="muted-arrow" /></Link>)}</div> : <div className="inline-empty">{templates.loading ? 'Loading templates…' : 'No templates available.'}</div>}
      </section>
      <section className="panel"><div className="panel-heading"><div><h2>Recent deployments</h2><p>Local CloudFormation simulations</p></div><Link to="/deployments" className="text-link">View history <ArrowRight size={15} /></Link></div>
        {deployments.data.length ? <div className="compact-list">{deployments.data.slice(0, 4).map(d => <div className="compact-row" key={d.id}><span className="row-icon row-icon-green"><UploadCloud size={17} /></span><span className="row-main"><strong>{d.stackName}</strong><small>{d.environment} · {formatDate(d.createdDate)}</small></span><StatusBadge status={d.status} /></div>)}</div> : <div className="inline-empty">{deployments.loading ? 'Loading deployments…' : 'No deployment history yet.'}</div>}
      </section>
    </div>
    <section className="quick-actions"><div><span className="eyebrow">GET MOVING</span><h2>Quick actions</h2><p>Standardize once, simulate safely.</p></div><div className="quick-action-links"><Link to="/templates/new"><span className="quick-icon"><Plus size={19} /></span><span><strong>Create template</strong><small>Define a reusable blueprint</small></span><ArrowRight size={16} /></Link><Link to="/templates"><span className="quick-icon"><Code2 size={19} /></span><span><strong>View templates</strong><small>Browse your library</small></span><ArrowRight size={16} /></Link><Link to="/deploy"><span className="quick-icon"><UploadCloud size={19} /></span><span><strong>Simulate deployment</strong><small>Preview a stack rollout</small></span><ArrowRight size={16} /></Link></div></section>
  </>
}

export function TemplatesPage() {
  const { data, error, loading, refresh } = useRemoteData(api.templates)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const shown = useMemo(() => data.filter(t => `${t.name} ${t.description} ${t.environment}`.toLowerCase().includes(query.toLowerCase())), [data, query])
  async function remove(template) {
    if (!window.confirm(`Delete "${template.name}"? This cannot be undone.`)) return
    try { await api.deleteTemplate(template.id); setNotice('Template deleted.'); setActionError(''); refresh() } catch (err) { setActionError(err.message) }
  }
  return <>
    <PageHeading eyebrow="LIBRARY" title="Templates" description="A single source of truth for consistent infrastructure in every environment." action={<ButtonLink to="/templates/new"><Plus size={17} /> New template</ButtonLink>} />
    <Alert type="success">{notice}</Alert><Alert>{error || actionError}</Alert>
    <div className="toolbar"><div className="search-wrap"><input aria-label="Search templates" placeholder="Search templates…" value={query} onChange={e => setQuery(e.target.value)} /></div><div className="toolbar-count">{shown.length} templates</div></div>
    {loading ? <div className="loading-state"><RefreshCw className="spin" size={18} />Loading templates…</div> : shown.length ? <div className="template-grid">{shown.map(t => <article className="template-card" key={t.id}><div className="template-card-top"><span className="template-symbol"><Code2 size={20} /></span><StatusBadge status={t.status} /></div><div className="template-version">{t.version} <span>·</span> {t.environment}</div><h2>{t.name}</h2><p className="template-description">{t.description || 'No description provided.'}</p><div className="template-meta"><span><span className={`env-dot env-${t.environment?.toLowerCase()}`} />{t.environment}</span><span>Created {formatDate(t.createdDate)}</span></div><div className="template-actions"><Link className="button button-secondary button-small" to={`/templates/${t.id}`}>View</Link><Link className="button button-secondary button-small" to={`/templates/${t.id}/edit`}>Edit</Link><Link className="button button-primary button-small" to={`/deploy?template=${t.id}`}>Deploy</Link><button className="icon-button delete-button" title="Delete template" onClick={() => remove(t)}><Trash2 size={16} /></button></div></article>)}</div> : <EmptyState title={query ? 'No matching templates' : 'Your template library is empty'} text={query ? 'Try another search term.' : 'Create a reusable CloudFormation template to get started.'} action={!query && <ButtonLink to="/templates/new"><Plus size={16} /> Create template</ButtonLink>} />}
  </>
}

export function TemplateEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [form, setForm] = useState({ name: '', description: '', environment: 'Development', version: 'v1.0', yamlContent: DEFAULT_YAML })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [validation, setValidation] = useState(null)
  const [loading, setLoading] = useState(editing)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!editing) return
    api.template(id).then(t => { setForm({ name: t.name, description: t.description || '', environment: t.environment, version: t.version || 'v1.0', yamlContent: t.yamlContent }); setError('') })
      .catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [id, editing])
  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  function validate() { const result = validateYaml(form.yamlContent); setValidation(result); setNotice(''); return result }
  async function save(event) {
    event.preventDefault(); setError(''); setNotice('')
    const result = validate()
    if (!result.valid) return
    setBusy(true)
    try {
      const saved = editing ? await api.updateTemplate(id, form) : await api.createTemplate(form)
      navigate(`/templates/${saved.id}`, { state: { notice: editing ? 'Template updated successfully.' : 'Template created successfully.' } })
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  if (loading) return <div className="loading-state"><RefreshCw className="spin" size={18} />Loading template…</div>
  return <>
    <PageHeading eyebrow={editing ? 'TEMPLATE EDITOR' : 'TEMPLATE BUILDER'} title={editing ? 'Edit template' : 'Create a template'} description="Define your infrastructure once, then reuse it across Development, Testing, and Production." />
    <Alert>{error}</Alert>
    <form onSubmit={save}>
      <div className="editor-layout"><section className="panel editor-fields"><div className="section-title"><span className="section-number">01</span><div><h2>Template details</h2><p>Identify where this blueprint will be used.</p></div></div><div className="form-stack">
        <label>Template name<input name="name" required placeholder="e.g. Standard Web Infrastructure" value={form.name} onChange={change} /></label>
        <label>Description<textarea name="description" rows="3" placeholder="What does this template provision?" value={form.description} onChange={change} /></label>
        <div className="field-grid"><label>Environment<select name="environment" value={form.environment} onChange={change}><option>Development</option><option>Testing</option><option>Production</option></select></label><label>Version<input name="version" value={form.version} onChange={change} /></label></div>
      </div></section><section className="panel yaml-panel"><div className="section-title"><span className="section-number">02</span><div><h2>CloudFormation YAML</h2><p>Basic local validation only. This does not call AWS.</p></div><span className="yaml-language">YAML</span></div><textarea className="yaml-editor" aria-label="CloudFormation YAML" spellCheck="false" name="yamlContent" value={form.yamlContent} onChange={e => { change(e); setValidation(null) }} /></section></div>
      <div className="editor-bottom"><div className="validation-result">{validation && <><span className={validation.valid ? 'validation-ok' : 'validation-fail'}>{validation.valid ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}{validation.valid ? 'Template is valid' : 'Template validation failed'}</span>{validation.errors.map(message => <small key={message}>{message}</small>)}</>}</div><div className="button-row"><Link className="button button-secondary" to={editing ? `/templates/${id}` : '/templates'}>Cancel</Link><button type="button" className="button button-secondary" onClick={() => { setForm(f => ({ ...f, yamlContent: '' })); setValidation(null) }}>Clear YAML</button><button type="button" className="button button-secondary" onClick={validate}><ShieldCheck size={16} />Validate</button><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save template'}<ArrowRight size={16} /></button></div></div>
    </form>
  </>
}

export function TemplateDetailsPage() {
  const { id } = useParams()
  const [template, setTemplate] = useState(null)
  const [error, setError] = useState('')
  const [validation, setValidation] = useState(null)
  const [busy, setBusy] = useState(false)
  const [searchParams] = useSearchParams()
  const locationState = window.history.state?.usr
  useEffect(() => { api.template(id).then(setTemplate).catch(err => setError(err.message)) }, [id])
  async function validate() {
    setBusy(true); setError('')
    try { setValidation(await api.validateTemplate(id)) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  if (error && !template) return <><PageHeading eyebrow="TEMPLATE" title="Template details" /><Alert>{error}</Alert><ButtonLink to="/templates" variant="secondary">Back to templates</ButtonLink></>
  if (!template) return <div className="loading-state"><RefreshCw className="spin" size={18} />Loading template…</div>
  const resources = [...template.yamlContent.matchAll(/^\s{2}([A-Za-z][A-Za-z0-9]*):\s*$(?:\r?\n)\s+Type:\s*AWS::([A-Za-z0-9]+)::([A-Za-z0-9]+)/gm)]
  const kinds = [...new Set(resources.map(match => match[3]))]
  return <>
    <div className="back-link"><Link to="/templates">← All templates</Link></div>
    <PageHeading eyebrow={`TEMPLATE · ${template.version}`} title={template.name} description={template.description} action={<div className="button-row"><Link className="button button-secondary" to={`/templates/${id}/edit`}>Edit template</Link><Link className="button button-primary" to={`/deploy?template=${id}`}><UploadCloud size={16} /> Simulate deploy</Link></div>} />
    {locationState?.notice && <Alert type="success">{locationState.notice}</Alert>}<Alert>{error}</Alert>
    <div className="details-grid"><section className="panel"><div className="panel-heading"><div><h2>Template overview</h2><p>Metadata saved in the local H2 database</p></div><StatusBadge status={template.status} /></div><div className="details-meta"><div><small>Environment</small><strong>{template.environment}</strong></div><div><small>Version</small><strong>{template.version}</strong></div><div><small>Created</small><strong>{formatDate(template.createdDate)}</strong></div><div><small>Last updated</small><strong>{formatDate(template.updatedDate)}</strong></div></div></section><section className="panel resource-panel"><div className="panel-heading"><div><h2>Resources detected</h2><p>Parsed from resource type declarations</p></div><span className="resource-total">{resources.length}</span></div><div className="resource-chips">{kinds.length ? kinds.map(kind => <span className="resource-chip" key={kind}><Server size={15} />{kind}</span>) : <span className="muted-text">No AWS resources detected.</span>}</div><button type="button" className="text-button" onClick={validate} disabled={busy}><ShieldCheck size={16} />{busy ? 'Validating…' : 'Validate template'}</button>{validation && <div className={`validation-inline ${validation.valid ? 'validation-good' : 'validation-bad'}`}>{validation.valid ? '✓ Template is valid' : `✗ ${validation.errors.join(' ')}`}</div>}</section></div>
    <section className="panel yaml-view-panel"><div className="panel-heading"><div><h2>Template source</h2><p>CloudFormation YAML · {template.environment}</p></div><span className="yaml-language">YAML</span></div><pre className="yaml-readonly">{template.yamlContent}</pre></section>
  </>
}

const DEPLOY_STEPS = ['Template validated', 'Stack creation started', 'VPC created', 'Subnet created', 'Security group created', 'EC2 created', 'S3 created']

export function DeployPage() {
  const [searchParams] = useSearchParams()
  const templates = useRemoteData(api.templates)
  const navigate = useNavigate()
  const [form, setForm] = useState({ templateId: searchParams.get('template') || '', environment: 'Development', region: 'us-east-1', stackName: 'platform-dev' })
  const [error, setError] = useState('')
  const [step, setStep] = useState(-1)
  const [deployment, setDeployment] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const selected = templates.data.find(t => String(t.id) === String(form.templateId))
    const environmentSuffix = { Development: 'dev', Testing: 'test', Production: 'prod' }
    if (selected) setForm(current => ({ ...current, environment: selected.environment, stackName: `platform-${environmentSuffix[selected.environment] || 'dev'}` }))
  }, [templates.data, form.templateId])
  async function simulate(event) {
    event.preventDefault(); setError(''); setDeployment(null); setBusy(true); setStep(0)
    try {
      const selectedTemplate = templates.data.find(t => String(t.id) === String(form.templateId))
      if (!selectedTemplate) throw new Error('Select a template before starting the simulation.')
      const check = await api.validateTemplate(selectedTemplate.id)
      if (!check.valid) throw new Error(`Invalid template: ${check.errors.join(' ')}`)
      for (let index = 0; index < DEPLOY_STEPS.length; index++) {
        setStep(index)
        await new Promise(resolve => window.setTimeout(resolve, 420))
      }
      const result = await api.simulateDeployment({ ...form, templateId: Number(form.templateId) })
      setDeployment(result)
      setStep(DEPLOY_STEPS.length)
    } catch (err) { setError(err.message); setStep(-1) } finally { setBusy(false) }
  }
  const set = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  return <>
    <PageHeading eyebrow="SAFE PREVIEW" title="Deployment simulation" description="Walk through a simulated CloudFormation rollout. No AWS resources are created." />
    <div className="simulation-notice"><span className="notice-icon"><Activity size={19} /></span><div><strong>This is a local simulation</strong><p>The backend records the run in H2 and returns a simulated CREATE_COMPLETE result. It never connects to AWS.</p></div></div>
    <div className="deploy-layout"><form className="panel deploy-form" onSubmit={simulate}><div className="section-title"><span className="section-number">01</span><div><h2>Configure stack</h2><p>Choose the template and target environment.</p></div></div><Alert>{error || templates.error}</Alert><div className="form-stack">
      <label>Template<select required name="templateId" value={form.templateId} onChange={set}><option value="">Select a template</option>{templates.data.map(t => <option value={t.id} key={t.id}>{t.name} · {t.version}</option>)}</select></label>
      <div className="field-grid"><label>Environment<select name="environment" value={form.environment} onChange={set}><option>Development</option><option>Testing</option><option>Production</option></select></label><label>Region<select name="region" value={form.region} onChange={set}><option>us-east-1</option><option>us-west-2</option><option>eu-west-1</option><option>ap-southeast-1</option></select></label></div>
      <label>Stack name<input required name="stackName" value={form.stackName} onChange={set} placeholder="platform-dev" /></label>
      <button className="button button-primary button-full" disabled={busy || !templates.data.length}>{busy ? 'Running simulation…' : 'Simulate deployment'}<ArrowRight size={16} /></button>
    </div></form><section className="panel progress-panel"><div className="section-title"><span className="section-number">02</span><div><h2>Simulation progress</h2><p>Expected steps for a standard platform stack.</p></div></div><div className="step-list">{DEPLOY_STEPS.map((label, index) => <div className={`step-row ${step >= index ? 'step-done' : ''} ${step === index && busy ? 'step-current' : ''}`} key={label}><span className="step-indicator">{step >= index ? <Check size={14} /> : index + 1}</span><span>{label}</span>{step >= index && <small>COMPLETE</small>}</div>)}</div>{deployment && <div className="deployment-complete"><CheckCircle2 size={20} /><div><strong>STATUS: CREATE_COMPLETE</strong><span>{deployment.stackName} recorded in deployment history</span></div></div>}<p className="simulation-footnote">All progress shown here is simulated for demonstration purposes.</p></section></div>
    {deployment && <div className="post-success"><span>Simulation saved to H2.</span><button className="text-button" onClick={() => navigate('/deployments')}>View deployment history <ArrowRight size={15} /></button></div>}
  </>
}

export function DeploymentHistoryPage() {
  const deployments = useRemoteData(api.deployments)
  return <>
    <PageHeading eyebrow="SIMULATION LOG" title="Deployment history" description="A persistent local record of simulated stack runs." action={<ButtonLink to="/deploy"><UploadCloud size={17} /> New simulation</ButtonLink>} />
    <Alert>{deployments.error}</Alert>
    <section className="panel table-panel">{deployments.loading ? <div className="loading-state"><RefreshCw className="spin" size={18} />Loading deployment history…</div> : deployments.data.length ? <div className="table-scroll"><table><thead><tr><th>Stack name</th><th>Template</th><th>Environment</th><th>Region</th><th>Status</th><th>Date</th></tr></thead><tbody>{deployments.data.map(d => <tr key={d.id}><td><strong className="stack-name">{d.stackName}</strong><small className="sub-cell">Simulation #{d.id}</small></td><td>{d.templateName || `Template #${d.templateId}`}</td><td><span className={`env-dot env-${d.environment?.toLowerCase()}`} />{d.environment}</td><td>{d.region}</td><td><StatusBadge status={d.status} /></td><td>{formatDate(d.createdDate)}</td></tr>)}</tbody></table></div> : <EmptyState title="No simulated deployments yet" text="Run a simulation to see its history here." action={<ButtonLink to="/deploy"><UploadCloud size={16} /> Start simulation</ButtonLink>} />}</section>
  </>
}

export function GitHubPage() {
  const files = [
    { name: 'platform-dev.yaml', env: 'Development', icon: Code2 },
    { name: 'platform-test.yaml', env: 'Testing', icon: Code2 },
    { name: 'platform-prod.yaml', env: 'Production', icon: Code2 },
  ]
  return <>
    <PageHeading eyebrow="SOURCE CONTROL PREVIEW" title="GitHub simulation" description="A lightweight local preview of how standardized templates could be organized in a repository." />
    <div className="repo-banner"><div className="repo-avatar"><Github size={25} /></div><div><span className="repo-label">Repository</span><h2>cloudstack-templates <span className="public-tag">Public demo</span></h2><p>Reusable CloudFormation platform templates across environments.</p></div><span className="simulation-label">SIMULATED</span></div>
    <div className="repo-details-grid"><section className="panel"><div className="panel-heading"><div><h2>Repository files</h2><p>Three environment-specific files in the main branch</p></div><span className="file-count">3 files</span></div><div className="repo-file-list">{files.map(({ name, env, icon: Icon }) => <div className="repo-file" key={name}><span className="file-icon"><Icon size={17} /></span><span><strong>{name}</strong><small>{env} template</small></span><span className="yaml-language">YAML</span></div>)}</div></section><section className="panel repo-info"><div className="info-row"><GitBranch size={18} /><span><small>Branch</small><strong>main</strong></span></div><div className="info-row"><Activity size={18} /><span><small>Last commit</small><strong>“Updated CloudFormation template”</strong><small>Local preview · no GitHub API</small></span></div><div className="repo-callout"><CircleAlert size={16} />This section is a static UI simulation. Files are illustrative and are not synchronized to GitHub.</div></section></div>
  </>
}

export function ProfilePage({ user }) {
  return <>
    <PageHeading eyebrow="ACCOUNT" title="Your profile" description="Local demo account information." />
    <section className="panel profile-panel"><div className="profile-avatar"><UserIcon /></div><div className="profile-info"><span className="eyebrow">CLOUDSTACK MEMBER</span><h2>{user?.name}</h2><p>{user?.email}</p></div><StatusBadge status={user?.role || 'USER'} /></section>
    <section className="panel profile-details"><div className="panel-heading"><div><h2>Account details</h2><p>Stored in the local H2 database</p></div></div><div className="details-meta"><div><small>Name</small><strong>{user?.name}</strong></div><div><small>Email address</small><strong>{user?.email}</strong></div><div><small>Role</small><strong>{user?.role}</strong></div><div><small>Authentication</small><strong>Simple demo login</strong></div></div></section>
    <div className="profile-warning"><CircleAlert size={17} />This academic demo uses a simple local login, not production-grade authentication. Do not reuse real passwords.</div>
  </>
}

function UserIcon() { return <span className="user-initials">CS</span> }
