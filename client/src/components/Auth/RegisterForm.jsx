import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().max(50).required('First name is required'),
  lastName: Yup.string().max(50).required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6).required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your password'),
});

export default function RegisterForm({ onSwitch }) {
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
        <Form className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Create your account</h2>
          <div>
            <label className="block font-medium">First Name</label>
            <Field name="firstName" className="w-full p-2 border rounded" />
            <ErrorMessage name="firstName" component="div" className="text-red-600 text-sm" />
          </div>
          <div>
            <label className="block font-medium">Last Name</label>
            <Field name="lastName" className="w-full p-2 border rounded" />
            <ErrorMessage name="lastName" component="div" className="text-red-600 text-sm" />
          </div>
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
          <div>
            <label className="block font-medium">Confirm Password</label>
            <Field name="confirmPassword" type="password" className="w-full p-2 border rounded" />
            <ErrorMessage name="confirmPassword" component="div" className="text-red-600 text-sm" />
          </div>
          {status?.error && <div className="text-red-600">{status.error}</div>}
          {status?.success && <div className="text-green-600">{status.success}</div>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
            Register
          </button>
          <button type="button" className="w-full border border-orange-500 text-orange-500 py-2 rounded mt-2 hover:bg-orange-50" onClick={onSwitch}>
            Already have an account? Login
          </button>
        </Form>
      )}
    </Formik>
  );
} 