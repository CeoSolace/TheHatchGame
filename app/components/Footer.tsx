export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 py-6">
      <div className="container mx-auto text-center text-sm">
        <p>&copy; {new Date().getFullYear()} THE HATCH. All rights reserved.</p>
      </div>
    </footer>
  )
}