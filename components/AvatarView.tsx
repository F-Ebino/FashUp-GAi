import React, { useState } from 'react';
import type { Avatar, Garment } from '../types';
import AvatarEditor from './AvatarEditor';
import AvatarDisplay from './AvatarDisplay';

interface AvatarViewProps {
  avatar: Avatar | null;
  saveAvatar: (avatarData: Avatar) => void;
  wardrobe: Garment[];
}

const AvatarView: React.FC<AvatarViewProps> = ({ avatar, saveAvatar, wardrobe }) => {
  const [isEditing, setIsEditing] = useState<boolean>(!avatar);
  
  const handleSave = (newAvatar: Avatar) => {
    saveAvatar(newAvatar);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (avatar) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">My Avatar</h2>
        <p className="text-gray-600">Create or update your digital version of yourself and try on your clothes virtually.</p>
      </div>
      
      {isEditing || !avatar ? (
        <AvatarEditor 
            initialAvatar={avatar}
            onSave={handleSave}
            onCancel={avatar ? handleCancel : undefined}
        />
      ) : (
        <AvatarDisplay 
            avatar={avatar} 
            wardrobe={wardrobe} 
            outfit={null}
            onEdit={() => setIsEditing(true)}
            showClosetPanel={false}
        />
      )}
    </div>
  );
};

export default AvatarView;