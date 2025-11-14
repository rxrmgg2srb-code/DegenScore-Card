// Agregar esto a tu componente DegenCard.tsx

import { useState } from 'react';
import ProfileFormModal, { ProfileData } from './ProfileFormModal';

// Dentro del componente:
const [showProfileModal, setShowProfileModal] = useState(false);
const [generatedWallet, setGeneratedWallet] = useState('');

// Función que se ejecuta DESPUÉS de generar la card exitosamente
const handleCardGenerated = async (walletAddress: string) => {
  setGeneratedWallet(walletAddress);
  setShowProfileModal(true); // Mostrar el modal
};

// Función cuando el usuario completa el formulario
const handleProfileSubmit = async (data: ProfileData) => {
  try {
    // Guardar los datos del perfil
    const response = await fetch('/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress: generatedWallet,
        ...data,
      }),
    });

    if (response.ok) {
      console.log('Profile updated successfully');
      setShowProfileModal(false);
      
      // Ahora mostrar el botón de download
      // o redirigir a la visualización de la card
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  }
};

// En el return del componente, agregar:
return (
  <div>
    {/* ... tu código existente ... */}
    
    {/* Modal de perfil */}
    <ProfileFormModal
      isOpen={showProfileModal}
      onClose={() => setShowProfileModal(false)}
      onSubmit={handleProfileSubmit}
      walletAddress={generatedWallet}
    />
  </div>
);

// MODIFICAR tu función generateCard existente:
const generateCard = async () => {
  try {
    setLoading(true);
    
    // ... tu código de generar la card ...
    
    const response = await fetch('/api/save-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress }),
    });

    if (response.ok) {
      const data = await response.json();
      
      // 🔥 DESPUÉS de generar, mostrar el modal
      handleCardGenerated(walletAddress);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
