//type for the props children
type props = {
    children: React.ReactNode
}
const layout = ({children}: props) => {
  return (
    <div className="bg-gray-800 h-screen relative inset-0 flex justify-center items-center">
        <div className="w-full max-w-md px-6">{children}</div>
    </div>
  )
}

export default layout