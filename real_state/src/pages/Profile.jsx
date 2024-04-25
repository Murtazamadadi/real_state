import { useRef,useEffect,useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
//========================================================= after user update
import {updateUserStart,updateUserSuccess,updateUserFailure} from "../redux/slicer/userSlicer"
//========================================================= after user delet user
import { deleteUserStart,deleteUserSuccess,deleteUserFailure } from '../redux/slicer/userSlicer';
//========================================================= after user signout 
import { signOutUserStart } from "../redux/slicer/userSlicer";

export default function Profile() {
  const { currentUser,loading,error} = useSelector((state) => state.user);
  //========================================================= after user update
  const dispatch=useDispatch()
  const fileRef=useRef()
  
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  //========================================================= after user update
  // console.log(formData)
  const [updateSuccess,setUpdateSuccess]=useState(false)

  // ====================== profile image uploading step -3
  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')
  
  // ====================== profile image uploading step -4
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  // ========================= UPdate user fuctionality ============
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  // =================================================== user delete handler function
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  // =================================================== user logout handler function
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };
  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>پروفایل</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        {/* =================================== profile image uploading step -1 */}
        <input
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
            ref={fileRef}
            hidden
            accept='image/*'
        />
          {/* ================================= profile image uploading step -2 */}
        <img
          onClick={()=>fileRef.current.click()} 
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />
          {/* ================================= profile image uploading step -5 */}
        <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              خطای بارگزاری گیری تصویر (تصویرنمیتواندبزرگتراز ۲ ام بی باشد!)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>تصویر با موفقیت بارگزازی شد</span>
          ) : (
            ''
          )}
        </p>
      
        <input
          type='text'
          placeholder='نام کاربری'
          id='username'
          className='border p-3 rounded-lg'
          defaultValue={currentUser?.username}
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='ایمیل'
          id='email'
          // ============ after apdate user =======
          defaultValue={currentUser?.email}
          onChange={handleChange}
          className='border p-3 rounded-lg'
        />
        <input
          type='password'
          placeholder='پاسورد'
          id='password'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <button
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading?"درحال بروزرسانی":"بروزرسانی"}
        </button>
      </form>


      <div className='flex justify-between mt-5'>
        {/* ===================================================== user delte functionality */}
        <span className='text-red-700 cursor-pointer' onClick={handleDeleteUser}>
          حذف حساب کاربری
        </span>
        {/* ===================================================== user logout functionality */}
        <span className='text-red-700 cursor-pointer' onClick={handleSignOut}>
          خارج شدن
        </span>
      </div>
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>      
    </div>
  );
}
