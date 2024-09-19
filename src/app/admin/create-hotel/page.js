'use client';

import { useState, memo, useEffect, useCallback } from 'react';
import { withAuth } from '@/hocs/withAuth';
import useCreateHotelForm from './hooks/useCreateHotelForm';
import BasicInfo from './components/BasicInfo';
import Address from './components/Address';
import Description from './components/Description';
import Photos from './components/Photos';
import Rooms from './components/Rooms';
import ProgressBar from '@/app/components/ProgressBar';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import styles from './createHotel.module.css';

function CreateHotelPage() {
  const {
    activeTab,
    setActiveTab,
    hotel,
    errors,
    isLoading,
    handleChange,
    handleRoomChange,
    handlePhotoChange,
    handleRoomPhotoChange,
    addPhotoInput,
    addRoomPhotoInput,
    removePhotoInput,
    removeRoomPhotoInput,
    handleSubmit
  } = useCreateHotelForm();

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const tabs = ['Basic Info', 'Address', 'Description', 'Photos', 'Rooms'];

  useEffect(() => {
    console.log('CreateHotelPage rendered with hotel state:', hotel);
    console.log('Errors:', errors);
  }, [hotel, errors]);

  const renderTabContent = useCallback(() => {
    console.log('Rendering tab content for tab:', activeTab);
    switch (activeTab) {
      case 0:
        return <BasicInfo hotel={hotel} handleChange={handleChange} errors={errors} />;
      case 1:
        return <Address hotel={hotel} handleChange={handleChange} errors={errors} />;
      case 2:
        return <Description hotel={hotel} handleChange={handleChange} errors={errors} />;
      case 3:
        return (
          <Photos
            photos={hotel.photos}
            handlePhotoChange={handlePhotoChange}
            addPhotoInput={addPhotoInput}
            removePhotoInput={removePhotoInput}
            errors={errors}
          />
        );
      case 4:
        return (
          <Rooms
            hotel={hotel}
            handleRoomChange={handleRoomChange}
            handleRoomPhotoChange={handleRoomPhotoChange}
            addRoomPhotoInput={addRoomPhotoInput}
            removeRoomPhotoInput={removeRoomPhotoInput}
            errors={errors}
          />
        );
      default:
        return null;
    }
  }, [activeTab, hotel, handleChange, handlePhotoChange, handleRoomChange, handleRoomPhotoChange, addPhotoInput, addRoomPhotoInput, removePhotoInput, removeRoomPhotoInput, errors]);

  const onSubmit = useCallback(async () => {
    console.log('Create Hotel button clicked');
    setSubmitAttempted(true);
    try {
      await handleSubmit();
      console.log('Hotel creation process completed');
    } catch (error) {
      console.error('Error during hotel creation:', error);
    }
  }, [handleSubmit]);

  const renderErrors = useCallback(() => {
    return Object.entries(errors).map(([key, value]) => (
      <li key={key} className={styles.errorItem}>
        <strong>{key}:</strong> {value}
      </li>
    ));
  }, [errors]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Hotel</h1>
      <ProgressBar steps={tabs} currentStep={activeTab} />
      <div className={styles.formContainer}>
        {renderTabContent()}
        <div className={styles.buttonContainer}>
          {activeTab > 0 && (
            <button
              className={styles.button}
              onClick={() => setActiveTab(activeTab - 1)}
            >
              Previous
            </button>
          )}
          {activeTab < tabs.length - 1 && (
            <button
              className={styles.button}
              onClick={() => setActiveTab(activeTab + 1)}
            >
              Next
            </button>
          )}
          {activeTab === tabs.length - 1 && (
            <button
              className={styles.submitButton}
              onClick={onSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Hotel'}
            </button>
          )}
        </div>
      </div>
      {isLoading && <LoadingSpinner />}
      {submitAttempted && Object.keys(errors).length > 0 && (
        <div className={styles.errorContainer}>
          <h3>Please correct the following errors:</h3>
          <ul className={styles.errorList}>
            {renderErrors()}
          </ul>
        </div>
      )}
    </div>
  );
}

export default withAuth(memo(CreateHotelPage));