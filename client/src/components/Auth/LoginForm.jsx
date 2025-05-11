import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function LoginForm() {
  const navigate = useNavigate();
  return (
    <>
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            const res = await axios.post('http://localhost:5124/api/Auth/login', values);
            setStatus({ success: 'Login successful!' });
            const token = res.data.token;
            localStorage.setItem('token', token);
            const payload = parseJwt(token);
            if (payload && payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) {
              const roles = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
              if (Array.isArray(roles)) {
                if (roles.includes('Admin')) {
                  navigate('/admin');
                } else if (roles.includes('Staff')) {
                  navigate('/staff');
                } else {
                  navigate('/home');
                }
              } else {
                if (roles === 'Admin') {
                  navigate('/admin');
                } else if (roles === 'Staff') {
                  navigate('/staff');
                } else {
                  navigate('/home');
                }
              }
            } else {
              navigate('/home');
            }
          } catch (err) {
            setStatus({ error: err.response?.data?.message || 'Login failed' });
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, status }) => (
          <Form className="w-full space-y-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Login to your account</h1>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">E-mail</label>
              <Field name="email" type="email" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="john@mail.com" />
              <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Password</label>
              <Field name="password" type="password" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="Password" />
              <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
            </div>
            {status?.error && <div className="text-red-600 font-medium text-center">{status.error}</div>}
            {status?.success && <div className="text-green-600 font-medium text-center">{status.success}</div>}
            <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-900 transition">
              Login
            </button>
            <button
              type="button"
              className="w-full border border-black text-black py-3 rounded-lg mt-2 font-semibold text-lg hover:bg-gray-100"
              onClick={() => navigate('/register')}
            >
              Don't have an account? Register
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
} 