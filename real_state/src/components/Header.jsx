import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect,useState } from 'react';


export default function Header() {
  const {currentUser}=useSelector((state)=>state.user)
  // console.log(currentUser)
  // ================================================================ After adding search functionlity
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  },[location.search]);

 
  return (
    <header className='bg-slate-200 shadow-md'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
            <span className='text-slate-500'>رهنمای املاگ</span>
            <span className='text-slate-700'>مددیان</span>
          </h1>
        </Link>
        <form
          onSubmit={handleSubmit}
          className='bg-slate-100 p-3 rounded-lg flex items-center'
        >
          <input
            type='text'
            placeholder='جستجو..'
            className='bg-transparent focus:outline-none w-24 sm:w-64'
            // ============================================================= after adding search functionality
            onChange={(e)=>setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <button>
            <FaSearch className='text-slate-600' />
          </button>
        </form>
        <ul className='flex gap-4'>
          <Link to='/'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>
              خانه
            </li>
          </Link>
          <Link to='/about'>
            <li className='hidden sm:inline text-slate-700 hover:underline'>
              درباره ما
            </li>
          </Link>
          <Link to='/profile'>
            {currentUser? (
              <img src={currentUser.avatar} alt='profile' className=' rounded-full h-7 w-7 object-cover'/>
            ):(
            <li className='hidden sm:inline text-slate-700 hover:underline'>
              ورود
            </li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
