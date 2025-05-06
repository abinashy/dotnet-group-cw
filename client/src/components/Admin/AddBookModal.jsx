import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';

const AddBookSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(200, 'Title is too long'),
  isbn: Yup.string().required('ISBN is required').max(13, 'ISBN must be 13 characters'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  publicationYear: Yup.number().required('Publication year is required').min(1800, 'Invalid year'),
  pageCount: Yup.number().required('Page count is required').min(1, 'Must have at least 1 page'),
  language: Yup.string().required('Language is required').max(20, 'Language name is too long'),
  format: Yup.string().required('Format is required').max(20, 'Format name is too long'),
  description: Yup.string(),
  coverImageUrl: Yup.string().max(500, 'URL is too long'),
  isAwardWinning: Yup.boolean(),
  status: Yup.string().required('Status is required').max(50, 'Status is too long'),
  publisherId: Yup.number().required('Publisher is required'),
  authorIds: Yup.array().of(Yup.number()).min(1, 'At least one author is required'),
  genreIds: Yup.array().of(Yup.number()).min(1, 'At least one genre is required'),
  newPublisher: Yup.object().shape({
    name: Yup.string().max(200, 'Name is too long'),
    description: Yup.string()
  }).nullable(),
  newAuthor: Yup.object().shape({
    firstName: Yup.string().max(100, 'First name is too long'),
    lastName: Yup.string().max(100, 'Last name is too long'),
    biography: Yup.string()
  }).nullable(),
  newGenre: Yup.object().shape({
    name: Yup.string().max(50, 'Name is too long'),
    description: Yup.string()
  }).nullable(),
  coverImageFile: Yup.mixed()
    .test('fileSize', 'File too large', value => !value || value.size <= 10000000) // 10MB
    .test('fileType', 'Unsupported file type', value => 
      !value || ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)
    ),
});

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Basic book information' },
  { id: 'details', title: 'Details', description: 'Additional book details' },
  { id: 'relations', title: 'Relations', description: 'Publisher, authors, and genres' }
];

function StepIndicator({ currentStep, steps, onStepClick }) {
  return (
    <nav aria-label="Progress" className="px-4 py-2">
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => (
          <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            <div className="flex items-center">
              <button
                onClick={() => onStepClick(index)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                  index < currentStep
                    ? 'bg-blue-600 hover:bg-blue-900'
                    : index === currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                } ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={index > currentStep}
              >
                <span className="text-white text-sm">{index + 1}</span>
              </button>
              {index !== steps.length - 1 && (
                <div className={`absolute top-4 w-full h-0.5 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
            <div className="absolute -bottom-6 w-max text-center text-xs font-medium">
              {step.title}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function BasicInfoStep() {
  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Field
          name="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          type="text"
        />
        <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ISBN</label>
        <Field
          name="isbn"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          type="text"
        />
        <ErrorMessage name="isbn" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <Field
          name="price"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          type="number"
          step="0.01"
        />
        <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <Field
          name="status"
          as="select"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Out of Print">Out of Print</option>
        </Field>
        <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Award Winning</label>
        <Field
          name="isAwardWinning"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <ErrorMessage name="isAwardWinning" component="div" className="mt-1 text-sm text-red-600" />
      </div>
    </div>
  );
}

function DetailsStep() {
  const fileInputRef = useRef(null);
  const { setFieldValue, values } = useFormikContext();
  const [previewUrl, setPreviewUrl] = useState('');

  // Initialize preview URL from existing file if any
  useEffect(() => {
    if (values.coverImageFile) {
      setPreviewUrl(URL.createObjectURL(values.coverImageFile));
    }
  }, [values.coverImageFile]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFieldValue('coverImageFile', file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFieldValue('coverImageFile', file);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFieldValue('coverImageFile', null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Publication Year</label>
          <Field
            name="publicationYear"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            type="number"
          />
          <ErrorMessage name="publicationYear" component="div" className="mt-1 text-sm text-red-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Page Count</label>
          <Field
            name="pageCount"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            type="number"
          />
          <ErrorMessage name="pageCount" component="div" className="mt-1 text-sm text-red-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <Field
            name="language"
            as="select"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a language</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
          </Field>
          <ErrorMessage name="language" component="div" className="mt-1 text-sm text-red-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <Field
            name="format"
            as="select"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a format</option>
            <option value="Paperback">Paperback</option>
            <option value="Hardcover">Hardcover</option>
            <option value="eBook">eBook</option>
            <option value="Audiobook">Audiobook</option>
          </Field>
          <ErrorMessage name="format" component="div" className="mt-1 text-sm text-red-600" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Field
          name="description"
          as="textarea"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows="3"
        />
        <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="space-y-1 text-center">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Cover preview"
                  className="mx-auto h-32 w-auto object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
        </div>
        <ErrorMessage name="coverImageFile" component="div" className="mt-1 text-sm text-red-600" />
      </div>
    </div>
  );
}

function RelationsStep({ publishers, authors, genres, setFieldValue }) {
  const [publisherMode, setPublisherMode] = useState('select');
  const [authorMode, setAuthorMode] = useState('select');
  const [genreMode, setGenreMode] = useState('select');

  // Handle mode changes
  useEffect(() => {
    if (publisherMode === 'select') {
      setFieldValue('newPublisher', null);
    } else {
      setFieldValue('publisherId', '');
    }
  }, [publisherMode, setFieldValue]);

  useEffect(() => {
    if (authorMode === 'select') {
      setFieldValue('newAuthor', null);
    } else {
      setFieldValue('authorIds', []);
    }
  }, [authorMode, setFieldValue]);

  useEffect(() => {
    if (genreMode === 'select') {
      setFieldValue('newGenre', null);
    } else {
      setFieldValue('genreIds', []);
    }
  }, [genreMode, setFieldValue]);

  return (
    <div className="space-y-6">
      {/* Publisher Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Publisher</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPublisherMode('select')}
              className={`px-3 py-1 text-sm rounded-md ${
                publisherMode === 'select'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setPublisherMode('create')}
              className={`px-3 py-1 text-sm rounded-md ${
                publisherMode === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Create New
            </button>
          </div>
        </div>

        {publisherMode === 'select' ? (
          <div>
            <Field
              name="publisherId"
              as="select"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a publisher</option>
              {publishers.map(publisher => (
                <option key={publisher.publisherId} value={publisher.publisherId}>
                  {publisher.name}
                </option>
              ))}
            </Field>
            <ErrorMessage name="publisherId" component="div" className="mt-1 text-sm text-red-600" />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Field
                name="newPublisher.name"
                type="text"
                placeholder="Publisher Name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <ErrorMessage name="newPublisher.name" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            <div>
              <Field
                name="newPublisher.description"
                as="textarea"
                placeholder="Publisher Description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Authors Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Authors</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAuthorMode('select')}
              className={`px-3 py-1 text-sm rounded-md ${
                authorMode === 'select'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setAuthorMode('create')}
              className={`px-3 py-1 text-sm rounded-md ${
                authorMode === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Create New
            </button>
          </div>
        </div>

        {authorMode === 'select' ? (
          <div className="space-y-2">
            <div className="max-h-48 overflow-y-auto p-2 border rounded-md">
              {authors.map(author => (
                <label key={author.authorId} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <Field
                    type="checkbox"
                    name="authorIds"
                    value={author.authorId.toString()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{`${author.firstName} ${author.lastName}`}</span>
                </label>
              ))}
            </div>
            <ErrorMessage name="authorIds" component="div" className="mt-1 text-sm text-red-600" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Field
                  name="newAuthor.firstName"
                  type="text"
                  placeholder="First Name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <ErrorMessage name="newAuthor.firstName" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              <div>
                <Field
                  name="newAuthor.lastName"
                  type="text"
                  placeholder="Last Name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <ErrorMessage name="newAuthor.lastName" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>
            <div>
              <Field
                name="newAuthor.biography"
                as="textarea"
                placeholder="Author Biography"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Genres Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">Genres</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGenreMode('select')}
              className={`px-3 py-1 text-sm rounded-md ${
                genreMode === 'select'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setGenreMode('create')}
              className={`px-3 py-1 text-sm rounded-md ${
                genreMode === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Create New
            </button>
          </div>
        </div>

        {genreMode === 'select' ? (
          <div className="space-y-2">
            <div className="max-h-48 overflow-y-auto p-2 border rounded-md">
              {genres.map(genre => (
                <label key={genre.genreId} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <Field
                    type="checkbox"
                    name="genreIds"
                    value={genre.genreId.toString()}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{genre.name}</span>
                </label>
              ))}
            </div>
            <ErrorMessage name="genreIds" component="div" className="mt-1 text-sm text-red-600" />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Field
                name="newGenre.name"
                type="text"
                placeholder="Genre Name"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <ErrorMessage name="newGenre.name" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            <div>
              <Field
                name="newGenre.description"
                as="textarea"
                placeholder="Genre Description"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddBookModal({ isOpen, onClose, onSubmit, publishers, authors, genres }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add New Book</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="pt-8 pb-4 bg-white border-b border-gray-200">
          <StepIndicator currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />
        </div>
        
        <Formik
          initialValues={{
            title: '',
            isbn: '',
            price: 0,
            publicationYear: new Date().getFullYear(),
            pageCount: 1,
            language: 'English',
            format: 'Paperback',
            description: '',
            coverImageUrl: '',
            publisherId: '',
            authorIds: [],
            genreIds: [],
            newPublisher: null,
            newAuthor: null,
            newGenre: null,
            isAwardWinning: false,
            status: 'Published',
            coverImageFile: null
          }}
          validationSchema={AddBookSchema}
          onSubmit={(values, formikHelpers) => {
            // Convert authorIds and genreIds to numbers
            const processedValues = {
              ...values,
              authorIds: values.authorIds.map(id => Number(id)),
              genreIds: values.genreIds.map(id => Number(id)),
              publisherId: Number(values.publisherId)
            };
            onSubmit(processedValues, formikHelpers);
          }}
        >
          {({ setFieldValue, isValid, dirty }) => (
            <Form className="p-6">
              <div className="min-h-[400px]">
                {currentStep === 0 && <BasicInfoStep />}
                {currentStep === 1 && <DetailsStep />}
                {currentStep === 2 && (
                  <RelationsStep
                    publishers={publishers}
                    authors={authors}
                    genres={genres}
                    setFieldValue={setFieldValue}
                  />
                )}
              </div>

              <div className="flex justify-between pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    currentStep === 0 ? 'invisible' : ''
                  }`}
                >
                  Previous
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!isValid || !dirty}
                    >
                      Add Book
                    </button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
} 