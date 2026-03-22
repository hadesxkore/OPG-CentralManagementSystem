import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sileo';
import { router } from '@/routes';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* ── Global sileo Toaster — top-center across every page ── */}
      <style>{`
         [data-sonner-toaster], [data-sileo-viewport], ol[role="region"], div[style*="z-index"] {
            z-index: 99999 !important;
         }
      `}</style>
      <Toaster
        position="top-center"
        offset={16}
        options={{
          fill: '#0f172a',
          styles: {
            title: 'text-white text-center!',
            description: 'text-white/70 text-center!',
          },
        }}
      />
    </>
  );
}

export default App;
