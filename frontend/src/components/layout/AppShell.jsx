import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightRail from './RightRail';

// Three columns from the Figma: nav sidebar | main column | right rail.
export default function AppShell() {
    return (
        <div className="min-h-screen bg-page">
            <div className="mx-auto flex w-full max-w-[1456px]">
                <Sidebar />
                <main className="min-h-screen min-w-0 flex-1 border-x border-line bg-surface pb-16 md:pb-0">
                    <Outlet />
                </main>
                <RightRail />
            </div>
        </div>
    );
}
