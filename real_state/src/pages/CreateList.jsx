import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { app } from "../firebase";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
// ================================================================== after submit listing form
const {currentUser}=useSelector((state)=>state.user)
const navigate=useNavigate()
// ================================================================== after submit listing form
  const [files, setFiles] = useState([]);
  const [imageUploadError,setImageUploadError]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  // ======================================================================== after list submit 
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(false)

  // console.log(formData)
  // ======================================================================= image uploading functionality
  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('بارگزاری فایل نا موفق');
          setUploading(false);
          console.log(err)
        });
    } else {
      setImageUploadError('دریکبار فقد ۶ تسویر میتوانید بارگزاری کنید');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  // =========================================================== form submit functionality
  const handleChage = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      }); 
    }
    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('عد عقل یک تصویر باید بارگزاری شود');
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('مبلغ تخفیف باید کمتر از مبلغ واقعی بدشد ');
      setLoading(true);
      setError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className='p-3 max-w-4xl mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>
        ساختن یک لیست
      </h1>
      <form className='flex flex-col sm:flex-row gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='کام کاربری'
            className='border p-3 rounded-lg'
            id='name'
            maxLength='62'
            minLength='10'
            required
            onChange={handleChage}
            value={formData.name}
          />
          <textarea
            type='text'
            placeholder='توضیحات'
            className='border p-3 rounded-lg'
            id='description'
            required
            onChange={handleChage}
            value={formData.description}
          />
          <input
            type='text'
            placeholder='آدرس'
            className='border p-3 rounded-lg'
            id='address'
            required
            onChange={handleChage}
            value={formData.address}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='sale'
                className='w-5'
                onChange={handleChage}
                checked={formData.type==="sale"}
              />
              <span>فروش</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='rent'
                className='w-5'
                onChange={handleChage}
                checked={formData.type==="rent"}
              />
              <span>اجاره</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='parking'
                className='w-5'
                onChange={handleChage}
                checked={formData.parking}
              />
              <span>پارکینگ</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='furnished'
                className='w-5'
                onChange={handleChage}
                checked={formData.furnished}
              />
              <span>مبلمان</span>
            </div>
            <div className='flex gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-5'
                onChange={handleChage}
                checked={formData.offer}
              />
              <span>پشنهاد</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bedrooms'
                min='1'
                max='10'
                required
                onChange={handleChage}
                value={formData.bedrooms}
                className='p-3 border border-gray-300 rounded-lg'
              />
              <p>تشناب</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bathrooms'
                min='1'
                max='10'
                required
                onChange={handleChage}
                value={formData.bathrooms}
                className='p-3 border border-gray-300 rounded-lg'
              />
              <p>اوتاق خواب</p>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='regularPrice'
                min='50'
                max='10000000'
                required
                onChange={handleChage}
                value={formData.regularPrice}
                className='p-3 border border-gray-300 rounded-lg'
              />
              <div className='flex flex-col items-center'>
                <p>مبلغ حقیقی</p>
                <span className='text-xs'>($ / month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className='flex items-center gap-2'>
                <input
                  type='number'
                  id='discountPrice'
                  min='0'
                  max='10000000'
                  required
                  onChange={handleChage}
                  value={formData.discountPrice}
                  className='p-3 border border-gray-300 rounded-lg'
                />
                <div className='flex flex-col items-center'>
                  <p>مبلغ تخفیف</p>
                  {formData.type === 'rent' && (
                    <span className='text-xs'>($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='flex flex-col flex-1 gap-4'>
          <p className='font-semibold'>
            تصاویر:
            <span className='font-normal text-gray-600 ml-2'>
              اولین تصویر منحث کاور خواهد بود و حدعقل ۶ تصویر میتوانید بارگزاری کنید
            </span>
          </p>
          <div className='flex gap-4'>
            <input
              className='p-3 border border-gray-300 rounded w-full'
              type='file'
              id='images'
              accept='image/*'
              multiple
              onChange={(e)=>setFiles(e.target.files)}
            />
            <p className='text-red-700 text-sm'>{imageUploadError && imageUploadError}</p>
            
            <button
              type='button'
              className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
              // =======================================================image uploading functionality==
              onClick={handleImageSubmit}
            >
             {uploading?"درحال بارگزاری":"بارگزاری"}
            </button>
          </div>
          {formData.imageUrls.length > 0 &&
              formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className='flex justify-between p-3 border items-center'
              >
                <img
                  src={url}
                  alt='listing image'
                  className='w-30 h-20 object-contain rounded-lg'
                />
                <button
                  type='button'
                  onClick={() => handleRemoveImage(index)}
                  className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'
                >
                  حذف
                </button>
              </div>
            ))}
        <button
          disabled={loading || uploading}
          className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading?"درحال ساختن لیست":"ساختن لیست"}
        </button>
        {error && <p className='text-red-700 text-sm'>{error}</p>}
        </div>
      </form>
    </main>
  );
}
