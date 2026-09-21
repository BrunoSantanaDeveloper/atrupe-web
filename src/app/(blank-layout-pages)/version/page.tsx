import packageJson from '../../../../package.json'

export default function VersionPage() {
  return <div>Versão: {packageJson.version}</div>
}
