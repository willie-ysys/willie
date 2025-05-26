import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  onResetFridge?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onResetFridge }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onResetFridge={onResetFridge} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
