import './style.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import ChatButton from './components/ChatButton.jsx';
import BackToTop from './components/BackToTop.jsx';
import Home from './page/Home.jsx';
import Tools from './page/Tools.jsx';
import './style.css';

/**
 * App - Component chính của ứng dụng
 * 
 * Component này sử dụng React Router v7 để định tuyến
 * bao gồm Header, Nav, Footer và các route chính.
 */

// Layout component để bọc nội dung của trang
const Layout = ({ children }) => (
  <>
    <Header />
    <Nav />
    <main className="min-h-[calc(100vh-200px)]">
      {children}
    </main>
    <Footer />
    <ChatButton />
    <BackToTop />
  </>
);

// Cấu hình router sử dụng React Router v7
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Home /></Layout>,
  },
  {
    path: "/home",
    loader: () => { return window.location.replace('/') },
  },
  {
    path: "/tools",
    element: <Layout><Tools /></Layout>,
  },
  {
    path: "/reasons",
    element: <Layout><div className="container py-20"><h1 className="text-4xl font-bold text-center">Tôi đến đây vì...</h1><p className="text-center mt-4">Trang này đang được phát triển</p></div></Layout>,
  },
  {
    path: "/support",
    element: <Layout><div className="container py-20"><h1 className="text-4xl font-bold text-center">Hỗ Trợ</h1><p className="text-center mt-4">Trang này đang được phát triển</p></div></Layout>,
  },
  {
    path: "/resources",
    element: <Layout><div className="container py-20"><h1 className="text-4xl font-bold text-center">Tài Nguyên</h1><p className="text-center mt-4">Trang này đang được phát triển</p></div></Layout>,
  },
  {
    path: "/health-professionals",
    element: <Layout><div className="container py-20"><h1 className="text-4xl font-bold text-center">Dành Cho Nhân Viên Y Tế</h1><p className="text-center mt-4">Trang này đang được phát triển</p></div></Layout>,
  },
  {
    path: "/communities",
    element: <Layout><div className="container py-20"><h1 className="text-4xl font-bold text-center">Dành Cho Cộng Đồng</h1><p className="text-center mt-4">Trang này đang được phát triển</p></div></Layout>,
  },
  {
    path: "*",
    loader: () => { return window.location.replace('/') },
  }
]);

// Simple BackToTopButton component nếu thành phần kia không hoạt động
const SimpleBackToTop = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '50px',
        height: '50px',
        backgroundColor: 'red',
        color: 'white',
        borderRadius: '50%',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        zIndex: 9999
      }}
    >
      ↑
    </button>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <SimpleBackToTop /> {/* Thêm nút back-to-top trực tiếp vào App */}
    </AuthProvider>
  );
}
