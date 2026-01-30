import React, { useEffect } from "react";
import BackButton from "../../components/buttons/BackButton";

function UserProfileForm({
  setUserProfileEditMode,
  userProfileEditMode,
  setUserProfileViewMode,
  userProfileViewMode,
}) {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (userProfileEditMode) {
        // Show alert message on page refresh/close
        e.preventDefault();
        e.returnValue = ''; // Triggers browser's default confirmation dialog
        alert('Are you sure you want to leave? Unsaved changes may be lost!');
        return 'Are you sure you want to leave? Unsaved changes may be lost!';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userProfileEditMode]);

  return (
    <div>
      UserProfileForm{" "}
      <button
        className="cursor-pointer"
        onClick={() => {
          setUserProfileEditMode(false);
          setUserProfileViewMode(true);
        }}
      >
        back
      </button>
    </div>
  );
}

export default UserProfileForm;