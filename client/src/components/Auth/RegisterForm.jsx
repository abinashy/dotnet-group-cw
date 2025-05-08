import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().max(50).required('First name is required'),
  lastName: Yup.string().max(50).required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6).required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
});

export default function RegisterForm() {
  const navigate = useNavigate();
  return (
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      }}
      validationSchema={RegisterSchema}
      onSubmit={async (values, { setSubmitting, setStatus }) => {
        try {
          await axios.post('http://localhost:5124/api/Auth/register', values);
          setStatus({ success: 'Registration successful! Please login.' });
        } catch (err) {
          setStatus({ error: err.response?.data?.message || 'Registration failed' });
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, status }) => (
        <Form className="w-full space-y-6">
          
          <div>
            <label className="block font-medium text-gray-700 mb-1">First Name</label>
            <Field name="firstName" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="First Name" />
            <ErrorMessage name="firstName" component="div" className="text-red-600 text-sm mt-1" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Last Name</label>
            <Field name="lastName" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="Last Name" />
            <ErrorMessage name="lastName" component="div" className="text-red-600 text-sm mt-1" />
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
          <div>
            <label className="block font-medium text-gray-700 mb-1">Confirm Password</label>
            <Field name="confirmPassword" type="password" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black" placeholder="Confirm Password" />
            <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm mt-1" />
          </div>
          {status?.error && <div className="text-red-600 font-medium text-center">{status.error}</div>}
          {status?.success && <div className="text-green-600 font-medium text-center">{status.success}</div>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-900 transition">
            Register
          </button>
          <button
            type="button"
            className="w-full border border-black text-black py-3 rounded-lg mt-2 font-semibold text-lg hover:bg-gray-100"
            onClick={() => navigate('/login')}
          >
            Already have an account? Login
          </button>
        </Form>
      )}
    </Formik>
  );
} 