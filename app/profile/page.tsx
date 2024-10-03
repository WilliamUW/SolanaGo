import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

export default function Profile() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center text-white animate-pulse">Your Profile</h1>
      <Card className="bg-white border-4 border-blue-400 rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="p-4 text-center">
          <Image src="/placeholder.svg?height=100&width=100" alt="Profile" width={100} height={100} className="rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-600">Jane Doe</h2>
          <p className="text-sm text-gray-500">Animal Explorer Extraordinaire</p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Stats</h3>
            <p className="text-sm text-gray-600">Animals Captured: 42</p>
            <p className="text-sm text-gray-600">Rare Sightings: 7</p>
            <p className="text-sm text-gray-600">Exploration Points: 1337</p>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Achievements</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Master Photographer</li>
              <li>Jungle Explorer</li>
              <li>Rare Species Finder</li>
            </ul>
          </div>
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 transform hover:scale-105">
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}