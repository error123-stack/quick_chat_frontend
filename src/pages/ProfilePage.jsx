import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/authContext";
import ProfilePictureCropModal from "../components/ProfilePictureCropModal";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [fileToCrop, setFileToCrop] = useState(null);
  const [cropImageUrl, setCropImageUrl] = useState(null); // object URL for crop modal, revoke on close
  const [croppedDataUrl, setCroppedDataUrl] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!fileToCrop) {
      setCropImageUrl(null);
      return;
    }

    const imageUrl = URL.createObjectURL(fileToCrop);
    setCropImageUrl(imageUrl);
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [fileToCrop]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFileToCrop(file);
    }
    e.target.value = "";
  };

  const closeCropModal = () => {
    setFileToCrop(null);
  };

  const handleCropConfirm = (base64) => {
    setCroppedDataUrl(base64);
    closeCropModal();
  };

  const handleCropCancel = () => {
    closeCropModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!croppedDataUrl) {
        await updateProfile({ fullName: name, bio });
        navigate("/");
        return;
      }
      await updateProfile({ profilePic: croppedDataUrl, fullName: name, bio });
      navigate("/");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const profilePreviewSrc =
    croppedDataUrl || authUser?.profilePic || cropImageUrl || assets.logo_icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[var(--bg-app)]">
      {fileToCrop && cropImageUrl && (
        <ProfilePictureCropModal
          imageSrc={cropImageUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      <div className="w-full max-w-2xl rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col items-center justify-center bg-[var(--bg-elevated)] border-b md:border-b-0 md:border-r border-[var(--border-subtle)]">
            <div className="relative group mb-5">
              <Avatar
                src={profilePreviewSrc}
                name={authUser.fullName}
                size="2xl"
                ring
              />
              <label
                htmlFor="avatar"
                aria-label="Choose profile photo"
                className="absolute bottom-0 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer transition-colors shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  onChange={handleFileSelect}
                  type="file"
                  id="avatar"
                  accept=".png,.jpg,.jpeg,image/*"
                  hidden
                />
              </label>
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] text-center">
              {authUser.fullName}
            </h2>
            {authUser.bio && (
              <p className="text-sm text-[var(--text-secondary)] text-center mt-1 max-w-[200px]">
                {authUser.bio}
              </p>
            )}
          </div>

          <div className="w-full md:w-3/5 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Edit profile
              </h3>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm text-[var(--text-secondary)] mb-1.5"
                >
                  Full name
                </label>
                <input
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  required
                  placeholder="Your name"
                  className="input-field"
                />
              </div>
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm text-[var(--text-secondary)] mb-1.5"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder="A short bio..."
                  required
                  className="input-field resize-none"
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
