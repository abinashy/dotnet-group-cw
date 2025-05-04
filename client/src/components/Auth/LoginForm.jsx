import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export default function LoginForm({ onSwitch }) {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={LoginSchema}
      onSubmit={async (values, { setSubmitting, setStatus }) => {
        try {
          await axios.post('http://localhost:5124/api/Auth/login', values);
          setStatus({ success: 'Login successful!' });
          // Save token, redirect, etc.
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
            <Field name="email" type="email" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="john@mail.com" />
            <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Password</label>
            <Field name="password" type="password" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Password" />
            <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
          </div>
          {status?.error && <div className="text-red-600 font-medium text-center">{status.error}</div>}
          {status?.success && <div className="text-green-600 font-medium text-center">{status.success}</div>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold text-lg hover:bg-orange-600 transition">
            Login
          </button>
          <button type="button" className="w-full border border-orange-500 text-orange-500 py-3 rounded-lg mt-2 font-semibold text-lg hover:bg-orange-50" onClick={onSwitch}>
            Don't have an account? Register
          </button>
        </Form>
      )}
    </Formik>
  );
} 