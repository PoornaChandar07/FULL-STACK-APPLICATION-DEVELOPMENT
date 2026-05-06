import {
  IonApp,
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonToast
} from '@ionic/react';
import { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setMessage('Please enter username and password');
    } else {
      setMessage(`Welcome ${username}! App is working successfully.`);
    }
    setShowToast(true);
  };

  return (
    <IonApp>
      <IonPage>
        <IonContent fullscreen>
          <div className="container">
            <div className="phone-frame">
              <div className="phone-notch"></div>

              <div className="app-screen">
                <div className="top-section">
                  <h1>Student Login</h1>
                  <p>Web to Mobile App Demo</p>
                </div>

                <div className="login-card">
                  <IonInput
                    placeholder="Enter Username"
                    value={username}
                    onIonChange={(e) => setUsername(e.detail.value!)}
                  />

                  <IonInput
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value!)}
                  />

                  <IonButton expand="block" onClick={handleLogin}>
                    Login
                  </IonButton>
                </div>
              </div>
            </div>
          </div>

          {/* Toast Message */}
          <IonToast
            isOpen={showToast}
            message={message}
            duration={2000}
            onDidDismiss={() => setShowToast(false)}
          />
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default App;