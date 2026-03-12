import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './css/App.css';

function App() {

  const [count, setCount] = useState(0);

  const handleCheckBackend = async () => {
    try {
      const result = await window.appnestClientFunctions.appBackend.invoke({
        apiFunctionName: 'function1',
        payload: {
          message: 'Hello from frontend!',
        },
      });
      console.log('Backend response:', result);
    } catch (err) {
      console.error('Backend invoke error:', err);
    }
  };

  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={handleCheckBackend}>
          Check Backend API
        </button>
        <p>
          Edit <code>src/AppMain.jsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more../// app-installation-frontend
      </p>
    </>
  );
}

export default App;
