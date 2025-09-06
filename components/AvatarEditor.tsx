import React, { useState } from 'react';
import type { Avatar } from '../types';
import AvatarForm from './AvatarCreationForm';
import RealisticAvatar from './RealisticAvatar';

interface AvatarEditorProps {
  initialAvatar: Avatar | null;
  onSave: (avatar: Avatar) => void;
  onCancel?: () => void;
}

const DEFAULT_AVATAR: Avatar = {
  bodyShape: 'masculine',
  skinTone: '#f2d0b1',
  hairColor: '#090806',
  hairStyle: 'short',
  facialHair: 'none',
  faceShape: 'oval',
  eyeColor: '#8c5a3c',
  height: 170,
  weight: 70,
  bodyType: 'fit',
  chest: 100,
  waist: 85,
  hips: 95,
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({ initialAvatar, onSave, onCancel }) => {
  const [avatar, setAvatar] = useState<Avatar>(initialAvatar || DEFAULT_AVATAR);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
         <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">{initialAvatar ? 'Edit Your Avatar' : 'Create Your Avatar'}</h2>
         <p className="text-gray-600 mb-6">Personalize your digital model to start trying on clothes.</p>
        <AvatarForm 
            avatar={avatar}
            setAvatar={setAvatar}
            onSave={() => onSave(avatar)}
            onCancel={onCancel}
            isEditing={!!initialAvatar}
        />
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Live Preview</h2>
        <div className="relative w-full h-96 min-h-[24rem] bg-gray-100 rounded-lg">
           <RealisticAvatar avatar={avatar} />
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;