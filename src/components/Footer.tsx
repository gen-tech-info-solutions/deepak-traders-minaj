import logo from '../assets/dt_logo.png';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';

const Footer = () => {
  return (
    <>
    <hr/>
      <footer className='bg-white md:px-14 px-3 w-[100%] pt-10 '>
        <div className='flex flex-col flex-wrap md:flex-row justify-between py-10'>
          <a href='/' >
            <img src={logo} alt='logo' className='mb-10 w-[60%] m-auto' />
          </a>
          <div className='w-[300px]'>
             <div>
              <h3 className="text-lg font-semibold mb-4">Connect with Us</h3>
              <div className="space-y-2">
                <a
                  href="https://www.instagram.com/deepak_traders01/"
                  target="_blank"
                  className="flex items-center space-x-2 text-gray-400 hover:text-black transition-colors"
                >
                   <FaInstagram size={18} />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.instagram.com/deepak_traders01/"
                  className="flex items-center space-x-2 text-gray-400 hover:text-black transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Twitter</span>
                </a>
              </div>
            </div>
          </div>
          <div className='w-[300px]'>
            <p className='text-[18px] font-semibold text-lg md:mt-0 mt-5'>
              Contact Info
            </p>
            <ul className='text-[#7D7D7D] leading-8 mt-5'>
              <li>
                <a
                  href='https://www.google.com/maps/place/DEEPAK+TRADERS/@18.954954,72.8267905,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7cf62b090ae19:0xe16949113eb84281!8m2!3d18.9549541!4d72.8316614!16s%2Fg%2F11f62w5y30?entry=ttu'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline block'
                >
                  Bldg. no. 21, Banian Road,
                  <br />
                  near Pydhonie, Marine Lines East,
                  <br />
                  A.I, P.Marg, Bhuleshwar, Mumbai, Maharashtra 400003
                </a>
              </li>
              <li>+91-9892806151 / 8454015692</li>
              <li>E-mail</li>
              <li>
                <a
                  href='mailto:pateldeepak1098@gmail.com'
                  className='text-[#7D7D7D] hover:underline'
                >
                  pateldeepak1098@gmail.com
                </a>
              </li>
              <li>Monday - Saturday</li>
            </ul>
          </div>
          <div className='w-[300px]'>
            {/* <p>map</p> */}
            <div className='w-[300px]'>
              {/* <p className="text-[18px] font-semibold text-lg md:mt-0 mt-5">Our Location</p> */}
              <div className='mt-5 rounded-xl overflow-hidden'>
                <iframe
                  src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.46871394958!2d72.83168909999999!3d18.954896400000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf62b090ae19%3A0xe16949113eb84281!2sDEEPAK%20TRADERS!5e0!3m2!1sen!2sin!4v1754418569564!5m2!1sen!2sin'
                  width='100%'
                  height='200'
                  style={{ border: 0 }}
                  allowFullScreen=''
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col md:flex-row items-center justify-between py-3 border-[#7D7D7D] border-t'>
          <p className='text-sm'>
            ©2025 All Right Reserved. Developed & Designed by Deepak Traders.
          </p>
          <div className='flex flex-row'>
            {/* <FaFacebookF size={16} />
            <FaInstagram size={16} className='ml-3' />
            <FaLinkedin size={16} className='ml-3' />
            <FaYoutube size={16} className='ml-3' /> */}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
