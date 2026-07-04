import { Outlet } from 'react-router-dom'
import { UserData } from '@/types/auth';
import { Animals } from "@/constants/animals";
import Navbar from './NavBar';
import Sidebar from './sidebar/Sidebar';

interface LayoutProps {
  bio: UserData | null;
}

export default function Layout({bio}:Readonly<LayoutProps>) {
  const fullName = `${bio?.lastname} ${bio?.firstname}`;
  const animal =
  Object.values(Animals)[
    Math.floor(Math.random() * Object.keys(Animals).length)
  ];
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar
          name={fullName}
          animal={animal}
      />
      <div
        className="
          flex-1 flex flex-col h-screen overflow-y-scroll 
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        "
      >
        <Navbar animal={animal} />
        <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
        </main>
      </div>
    </div>
  )
}
