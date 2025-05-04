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
        <Form className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Login to your account</h2>
          <div>
            <label className="block font-medium">Email</label>
            <Field name="email" type="email" className="w-full p-2 border rounded" />
            <ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
          </div>
          <div>
            <label className="block font-medium">Password</label>
            <Field name="password" type="password" className="w-full p-2 border rounded" />
            <ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
          </div>
          {status?.error && <div className="text-red-600">{status.error}</div>}
          {status?.success && <div className="text-green-600">{status.success}</div>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
            Login
          </button>
          <button type="button" className="w-full border border-orange-500 text-orange-500 py-2 rounded mt-2 hover:bg-orange-50" onClick={onSwitch}>
            Don't have an account? Register
          </button>
        </Form>
      )}
    </Formik>
  );
} 