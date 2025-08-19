import { Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-300 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-300">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-gray-300">
          <div className="flex items-center gap-3">
            <Linkedin className="w-5 h-5" />
            <a 
              href="https://www.linkedin.com/in/mgraj" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-100 transition-colors"
            > 
              Connect on LinkedIn
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5" />
            <span>Contact Us: contact.plamento@gmail.com</span>
          </div>
        </div>
        
        <div className="text-center mt-6 pt-6 border-t border-gray-700 text-gray-300">
          <p className="text-sm text-gray-400">&copy; 2024 Plamento. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
