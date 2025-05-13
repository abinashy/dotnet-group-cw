import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';

const AddBookSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(200, 'Title is too long'),
  isbn: Yup.string().required('ISBN is required').max(13, 'ISBN must be 13 characters'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  publicationDate: Yup.date()
    .required('Publication date is required')
    .min(new Date('1000-01-01'), 'Date cannot be before 1000')
    .max(new Date('2100-01-01'), 'Date cannot be after 2100')
    .typeError('Please enter a valid date'),
  pageCount: Yup.number().required('Page count is required').min(1, 'Must have at least 1 page'),
  language: Yup.string().required('Language is required').max(20, 'Language name is too long'),
  format: Yup.string().required('Format is required').max(30, 'Format name is too long'),
  description: Yup.string(),
  coverImageUrl: Yup.string().max(500, 'URL is too long'),
  isAwardWinning: Yup.boolean(),
  status: Yup.string().required('Status is required').max(50, 'Status is too long'),
  publisherId: Yup.string().test('publisher-required', 'Publisher is required', function(value) {
    // Either publisherId or newPublisher should be provided
    return !!value || !!this.parent.newPublisher?.name;
  }),
  authorIds: Yup.array().of(Yup.string()).test('authors-required', 'At least one author is required', function(value) {
    // Either authorIds or newAuthors should be provided
    return (value && value.length > 0) || (this.parent.newAuthors && this.parent.newAuthors.length > 0 && this.parent.newAuthors[0].firstName);
  }),
  genreIds: Yup.array().of(Yup.string()).test('genres-required', 'At least one genre is required', function(value) {
    // Either genreIds or newGenres should be provided
    return (value && value.length > 0) || (this.parent.newGenres && this.parent.newGenres.length > 0 && this.parent.newGenres[0].name);
  }),
  newPublisher: Yup.object().shape({
    name: Yup.string().max(200, 'Name is too long'),
    description: Yup.string()
  }).nullable(),
  newAuthors: Yup.array().of(
    Yup.object().shape({
    firstName: Yup.string().max(100, 'First name is too long'),
    lastName: Yup.string().max(100, 'Last name is too long'),
    biography: Yup.string()
    })
  ),
  newGenres: Yup.array().of(
    Yup.object().shape({
    name: Yup.string().max(50, 'Name is too long'),
    description: Yup.string()
    })
  ),
  coverImageFile: Yup.mixed()
    .nullable()
    .test('fileSize', 'File too large', value => !value || value.size <= 10000000) // 10MB
    .test('fileType', 'Unsupported file type', value => 
      !value || ['image/jpeg', 'image/png', 'image/gif'].includes(value.type)
    ),
});

const steps = [
  { id: 'basic', title: 'Basic Info', description: 'Basic book information' },
  { id: 'details', title: 'Details', description: 'Additional book details' },
  { id: 'publishers', title: 'Publisher', description: 'Select or add publisher' },
  { id: 'authors', title: 'Authors', description: 'Select or add authors' },
  { id: 'genres', title: 'Genres', description: 'Select or add genres' }
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
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  index < currentStep
                    ? 'bg-black hover:bg-gray-800'
                    : index === currentStep
                    ? 'bg-black'
                    : 'bg-gray-300'
                } ${index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={index > currentStep}
              >
                <span className="text-white text-sm">{index + 1}</span>
              </button>
              {index !== steps.length - 1 && (
                <div className={`absolute top-4 left-7 h-1 w-16 sm:w-24 ${index < currentStep ? 'bg-black' : 'bg-gray-300'}`} />
              )}
            </div>
            <div className="absolute -bottom-6 w-max text-center text-xs font-medium text-gray-700">
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
    <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <Field
          name="title"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          type="text"
        />
        <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">ISBN</label>
        <Field
          name="isbn"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          type="text"
        />
        <ErrorMessage name="isbn" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <Field
          name="price"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
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
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
        >
          <option value="Published">Published</option>
          <option value="Upcoming">Coming Soon</option>
          
        </Field>
        <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Award Winning</label>
        <Field
          name="isAwardWinning"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-500"
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

  // Initialize preview URL from existing coverImageUrl or file
  useEffect(() => {
    // If we have a file, use that for preview
    if (values.coverImageFile) {
      const objectUrl = URL.createObjectURL(values.coverImageFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } 
    // If we have a coverImageUrl (from existing book), use that
    else if (values.coverImageUrl) {
      setPreviewUrl(values.coverImageUrl);
    }
  }, [values.coverImageFile, values.coverImageUrl]);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      // Only revoke object URLs created from files (not remote URLs)
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Revoke previous object URL if it exists and is a blob
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFieldValue('coverImageFile', file);
      // Clear the old coverImageUrl when a new file is selected
      if (values.coverImageUrl) {
        setFieldValue('coverImageUrl', '');
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      // Revoke previous object URL if it exists and is a blob
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setFieldValue('coverImageFile', file);
      // Clear the old coverImageUrl when a new file is dropped
      if (values.coverImageUrl) {
        setFieldValue('coverImageUrl', '');
      }
    }
  };

  const handleRemoveImage = () => {
    // Revoke previous object URL if it exists and is a blob
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl('');
    setFieldValue('coverImageFile', null);
    setFieldValue('coverImageUrl', '');
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Publication Date</label>
          <Field
            name="publicationDate"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
            type="date"
          />
          <ErrorMessage name="publicationDate" component="div" className="mt-1 text-sm text-red-600" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Page Count</label>
          <Field
            name="pageCount"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          >
            <option value="">Select a format</option>
            <option value="Paperback">Paperback</option>
            <option value="Hardcover">Hardcover</option>
            <option value="eBook">eBook</option>
            <option value="Audiobook">Audiobook</option>
            <option value="Limited Edition">Limited Edition</option>
            <option value="Signed Edition">Signed Edition</option>
            <option value="Collector's Edition">Collector's Edition</option>
            <option value="Large Print">Large Print</option>
            <option value="Illustrated">Illustrated</option>
            <option value="Box Set">Box Set</option>
            <option value="Graphic Novel">Graphic Novel</option>
            <option value="Manga">Manga</option>
          </Field>
          <ErrorMessage name="format" component="div" className="mt-1 text-sm text-red-600" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <Field
          name="description"
          as="textarea"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
          rows="3"
        />
        <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        {values.coverImageUrl && (
          <p className="text-xs text-gray-500 mb-2">Current image URL: {values.coverImageUrl}</p>
        )}
        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="space-y-1 text-center">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Cover preview"
                  className="mx-auto h-40 w-auto object-cover"
                  onError={(e) => {
                    console.error('Image failed to load:', previewUrl);
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="200" viewBox="0 0 150 200" fill="none"><rect width="150" height="200" fill="%23E5E7EB"/><text x="75" y="100" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="%234B5563">No Cover</text></svg>`;
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-black text-white rounded-full p-1"
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
                    className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500"
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

function PublisherStep({ publishers }) {
  const [publisherMode, setPublisherMode] = useState('select');
  const { setFieldValue, values } = useFormikContext();
  const [addedPublisher, setAddedPublisher] = useState(null);

  // Initialize component state based on form values
  useEffect(() => {
    // Check if we have a publisherId set (existing publisher selected)
    if (values.publisherId) {
      setPublisherMode('select');
    } 
    // Check if we have a new publisher that was being created or was confirmed
    else if (values.newPublisher?.name) {
      // If it was confirmed, show as added
      if (values.newPublisher._isConfirmed) {
        setAddedPublisher({
          name: values.newPublisher.name,
          description: values.newPublisher.description || ''
        });
        setPublisherMode('added');
      } 
      // Otherwise, keep in creation mode
      else {
        setPublisherMode('create');
      }
    }
  }, []);

  // DON'T reset publisher data when changing modes - this caused data loss
  useEffect(() => {
    // We only need to clear opposite data when switching modes
    // But KEEP the data that was entered
    if (publisherMode === 'select' && addedPublisher) {
      // Clear added publisher display if we switch to select mode
      setAddedPublisher(null);
    }
  }, [publisherMode, addedPublisher]);

  // Handle adding a new publisher
  const handleAddPublisher = (e) => {
    // Prevent form submission
    if (e) e.preventDefault();
    
    if (values.newPublisher?.name) {
      // Store the newly added publisher for display
      setAddedPublisher({
        name: values.newPublisher.name,
        description: values.newPublisher.description || ''
      });
      
      // Mark the publisher as explicitly confirmed
      setFieldValue('newPublisher', {
        ...values.newPublisher,
        _isConfirmed: true
      });
      
      // Switch to added mode to show the added publisher
      setPublisherMode('added');
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Publisher Information</h3>
        {!addedPublisher && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPublisherMode('select')}
              className={`px-3 py-1 text-sm rounded-md ${
                publisherMode === 'select'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={!!values.newPublisher?.name}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setPublisherMode('create')}
              className={`px-3 py-1 text-sm rounded-md ${
                publisherMode === 'create'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={!!values.publisherId}
            >
              Add New
            </button>
          </div>
        )}
        </div>

      {addedPublisher ? (
        <div className="p-4 border rounded-md bg-gray-50">
          <div className="flex justify-between items-start">
          <div>
              <h4 className="font-medium text-lg">{addedPublisher.name}</h4>
              {addedPublisher.description && (
                <p className="text-gray-600 mt-1">{addedPublisher.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setAddedPublisher(null);
                setPublisherMode('select');
                setFieldValue('newPublisher', null);
              }}
              className="text-gray-600 hover:text-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">New Publisher Added</span>
          </div>
        </div>
      ) : publisherMode === 'select' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Publisher</label>
            <Field
              name="publisherId"
              as="select"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              disabled={publisherMode === 'create' || !!values.newPublisher?.name}
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
            <label className="block text-sm font-medium text-gray-700">Publisher Name</label>
              <Field
                name="newPublisher.name"
                type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              />
              <ErrorMessage name="newPublisher.name" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Publisher Description</label>
              <Field
                name="newPublisher.description"
                as="textarea"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                rows={2}
              />
            </div>
          <div className="flex justify-end pt-2">
            <button 
              type="button"
              onClick={(e) => handleAddPublisher(e)}
              className="px-3 py-1 text-sm rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-400"
              disabled={!values.newPublisher?.name}
            >
              Add Publisher
            </button>
            </div>
          </div>
        )}
      </div>
  );
}

function AuthorsStep({ authors }) {
  const [authorMode, setAuthorMode] = useState('select');
  const { setFieldValue, values } = useFormikContext();
  const [newAuthorFields, setNewAuthorFields] = useState([{ firstName: '', lastName: '', biography: '' }]);
  const [addedAuthors, setAddedAuthors] = useState([]);

  // Initialize component state based on form values
  useEffect(() => {
    // If we have selected existing authors, go to select mode
    if (values.authorIds && values.authorIds.length > 0) {
      setAuthorMode('select');
    }
    
    // If we have new authors data being created
    if (values.newAuthors && values.newAuthors.length > 0) {
      // Restore the added authors
      setAddedAuthors([...values.newAuthors]);
      
      // Set to create mode if we have added authors
      setAuthorMode('create');
      
      // Don't lose authors in the creation form
      if (values.newAuthorInProgress) {
        setNewAuthorFields([...values.newAuthorInProgress]);
      }
    }
  }, []);

  // Track in-progress author entries (not yet added)
  useEffect(() => {
    // Save the in-progress author fields to form values
    setFieldValue('newAuthorInProgress', newAuthorFields);
  }, [newAuthorFields, setFieldValue]);

  // Don't reset authors when switching modes to prevent data loss
  useEffect(() => {
    // We only update form values based on the selected mode
    // but we don't clear data to prevent loss
    if (authorMode === 'select') {
      // Nothing to do - we keep newAuthors in case user switches back
    } else if (authorMode === 'create') {
      // Nothing to do - we keep authorIds in case user switches back
    }
  }, [authorMode]);

  // Add a new author field
  const addNewAuthor = () => {
    setNewAuthorFields([...newAuthorFields, { firstName: '', lastName: '', biography: '' }]);
  };

  // Remove an author field
  const removeAuthor = (index) => {
    const updatedFields = [...newAuthorFields];
    updatedFields.splice(index, 1);
    setNewAuthorFields(updatedFields);
  };

  // Handle adding an author from the form
  const handleAddAuthor = (index, e) => {
    // Prevent form submission
    if (e) e.preventDefault();
    
    const author = newAuthorFields[index];
    if (author.firstName && author.lastName) {
      // Add the author to our list of added authors
      const updatedAuthors = [...addedAuthors, author];
      setAddedAuthors(updatedAuthors);
      
      // Remove the author from the editing fields
      const updatedFields = [...newAuthorFields];
      updatedFields.splice(index, 1);
      
      // If there are no more fields, add an empty one
      if (updatedFields.length === 0) {
        updatedFields.push({ firstName: '', lastName: '', biography: '' });
      }
      
      setNewAuthorFields(updatedFields);
      
      // Update the form values
      setFieldValue('newAuthors', updatedAuthors);
      setFieldValue('newAuthorInProgress', updatedFields);
    }
  };
  
  // Remove an added author
  const removeAddedAuthor = (index) => {
    const updatedAuthors = [...addedAuthors];
    updatedAuthors.splice(index, 1);
    setAddedAuthors(updatedAuthors);
    setFieldValue('newAuthors', updatedAuthors);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Author Information</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAuthorMode('select')}
              className={`px-3 py-1 text-sm rounded-md ${
                authorMode === 'select'
                ? 'bg-black text-white'
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
                ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
            Add New
            </button>
          </div>
        </div>

        {authorMode === 'select' ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Select Authors</label>
          <div className="max-h-60 overflow-y-auto p-2 border rounded-md">
              {authors.map(author => (
                <label key={author.authorId} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <Field
                    type="checkbox"
                    name="authorIds"
                    value={author.authorId.toString()}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                  />
                  <span className="ml-2">{`${author.firstName} ${author.lastName}`}</span>
                </label>
              ))}
            </div>
            <ErrorMessage name="authorIds" component="div" className="mt-1 text-sm text-red-600" />
          </div>
        ) : (
        <div className="space-y-4">
          {/* Display already added authors */}
          {addedAuthors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Added Authors:</h4>
              <div className="space-y-2">
                {addedAuthors.map((author, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200">
              <div>
                      <span className="font-medium">{author.firstName} {author.lastName}</span>
                      {author.biography && (
                        <p className="text-sm text-gray-600 mt-1">{author.biography}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAddedAuthor(idx)}
                      className="text-gray-600 hover:text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Author creation fields */}
          {newAuthorFields.map((field, index) => (
            <div key={index} className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Author #{index + 1}</h4>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => handleAddAuthor(index, e)}
                    className="text-gray-600 hover:text-black"
                    disabled={!field.firstName || !field.lastName}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {newAuthorFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="text-gray-600 hover:text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                  type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    value={field.firstName}
                    onChange={(e) => {
                      const updatedFields = [...newAuthorFields];
                      updatedFields[index].firstName = e.target.value;
                      setNewAuthorFields(updatedFields);
                    }}
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                  type="text"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                    value={field.lastName}
                    onChange={(e) => {
                      const updatedFields = [...newAuthorFields];
                      updatedFields[index].lastName = e.target.value;
                      setNewAuthorFields(updatedFields);
                    }}
                  />
              </div>
            </div>
              
            <div>
                <label className="block text-sm font-medium text-gray-700">Biography</label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                  rows={2}
                  value={field.biography}
                  onChange={(e) => {
                    const updatedFields = [...newAuthorFields];
                    updatedFields[index].biography = e.target.value;
                    setNewAuthorFields(updatedFields);
                  }}
                />
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="button"
                  onClick={(e) => handleAddAuthor(index, e)}
                  className="px-3 py-1 text-sm rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-400"
                  disabled={!field.firstName || !field.lastName}
                >
                  Add Author
                </button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addNewAuthor}
              className="px-4 py-2 border border-black text-black rounded-md hover:bg-gray-100"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Author
              </span>
            </button>
            </div>
          </div>
        )}
      </div>
  );
}

function GenresStep({ genres }) {
  const [genreMode, setGenreMode] = useState('select');
  const { setFieldValue, values } = useFormikContext();
  const [newGenreFields, setNewGenreFields] = useState([{ name: '', description: '' }]);
  const [addedGenres, setAddedGenres] = useState([]);

  // Initialize component state based on form values
  useEffect(() => {
    // If we have selected existing genres, go to select mode
    if (values.genreIds && values.genreIds.length > 0) {
      setGenreMode('select');
    }
    
    // If we have new genres data being created
    if (values.newGenres && values.newGenres.length > 0) {
      // Restore the added genres
      setAddedGenres([...values.newGenres]);
      
      // Set to create mode if we have added genres
      setGenreMode('create');
      
      // Don't lose genres in the creation form
      if (values.newGenreInProgress) {
        setNewGenreFields([...values.newGenreInProgress]);
      }
    }
  }, []);

  // Track in-progress genre entries (not yet added)
  useEffect(() => {
    // Save the in-progress genre fields to form values
    setFieldValue('newGenreInProgress', newGenreFields);
  }, [newGenreFields, setFieldValue]);

  // Don't reset genres when switching modes to prevent data loss
  useEffect(() => {
    // We only update form values based on the selected mode
    // but we don't clear data to prevent loss
    if (genreMode === 'select') {
      // Nothing to do - we keep newGenres in case user switches back
    } else if (genreMode === 'create') {
      // Nothing to do - we keep genreIds in case user switches back
    }
  }, [genreMode]);

  // Add a new genre field
  const addNewGenre = () => {
    setNewGenreFields([...newGenreFields, { name: '', description: '' }]);
  };

  // Remove a genre field
  const removeGenre = (index) => {
    const updatedFields = [...newGenreFields];
    updatedFields.splice(index, 1);
    setNewGenreFields(updatedFields);
  };

  // Handle adding a genre from the form
  const handleAddGenre = (index, e) => {
    // Prevent form submission
    if (e) e.preventDefault();
    
    const genre = newGenreFields[index];
    if (genre.name) {
      // Add the genre to our list of added genres
      const updatedGenres = [...addedGenres, genre];
      setAddedGenres(updatedGenres);
      
      // Remove the genre from the editing fields
      const updatedFields = [...newGenreFields];
      updatedFields.splice(index, 1);
      
      // If there are no more fields, add an empty one
      if (updatedFields.length === 0) {
        updatedFields.push({ name: '', description: '' });
      }
      
      setNewGenreFields(updatedFields);
      
      // Update the form values
      setFieldValue('newGenres', updatedGenres);
      setFieldValue('newGenreInProgress', updatedFields);
    }
  };
  
  // Remove an added genre
  const removeAddedGenre = (index) => {
    const updatedGenres = [...addedGenres];
    updatedGenres.splice(index, 1);
    setAddedGenres(updatedGenres);
    setFieldValue('newGenres', updatedGenres);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Genre Information</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGenreMode('select')}
              className={`px-3 py-1 text-sm rounded-md ${
                genreMode === 'select'
                ? 'bg-black text-white'
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
                ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
            Add New
            </button>
          </div>
        </div>

        {genreMode === 'select' ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Select Genres</label>
          <div className="max-h-60 overflow-y-auto p-2 border rounded-md">
              {genres.map(genre => (
                <label key={genre.genreId} className="flex items-center p-2 hover:bg-gray-50 rounded">
                  <Field
                    type="checkbox"
                    name="genreIds"
                    value={genre.genreId.toString()}
                  className="rounded border-gray-300 text-black focus:ring-gray-500"
                  />
                  <span className="ml-2">{genre.name}</span>
                </label>
              ))}
            </div>
            <ErrorMessage name="genreIds" component="div" className="mt-1 text-sm text-red-600" />
          </div>
        ) : (
        <div className="space-y-4">
          {/* Display already added genres */}
          {addedGenres.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Added Genres:</h4>
              <div className="space-y-2">
                {addedGenres.map((genre, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-md bg-gray-50 border border-gray-200">
            <div>
                      <span className="font-medium">{genre.name}</span>
                      {genre.description && (
                        <p className="text-sm text-gray-600 mt-1">{genre.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAddedGenre(idx)}
                      className="text-gray-600 hover:text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genre creation fields */}
          {newGenreFields.map((field, index) => (
            <div key={index} className="p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700">Genre #{index + 1}</h4>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => handleAddGenre(index, e)}
                    className="text-gray-600 hover:text-black"
                    disabled={!field.name}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {newGenreFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGenre(index)}
                      className="text-gray-600 hover:text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">Genre Name</label>
                <input
                type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                  value={field.name}
                  onChange={(e) => {
                    const updatedFields = [...newGenreFields];
                    updatedFields[index].name = e.target.value;
                    setNewGenreFields(updatedFields);
                  }}
                />
            </div>
              
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                rows={2}
                  value={field.description}
                  onChange={(e) => {
                    const updatedFields = [...newGenreFields];
                    updatedFields[index].description = e.target.value;
                    setNewGenreFields(updatedFields);
                  }}
              />
            </div>
              <div className="flex justify-end pt-2">
                <button 
                  type="button"
                  onClick={(e) => handleAddGenre(index, e)}
                  className="px-3 py-1 text-sm rounded-md bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-400"
                  disabled={!field.name}
                >
                  Add Genre
                </button>
          </div>
      </div>
          ))}
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={addNewGenre}
              className="px-4 py-2 border border-black text-black rounded-md hover:bg-gray-100"
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Another Genre
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddBookModal({ isOpen, onClose, onSubmit, publishers, authors, genres, editingBook }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Debug log for editing book
  console.log('EditingBook prop:', editingBook);
  
  // Initialize form with editing book data or defaults
  const initialValues = editingBook ? {
    title: editingBook.title || '',
    isbn: editingBook.isbn || '',
    price: editingBook.price || 0,
    publicationDate: editingBook.publicationDate && new Date(editingBook.publicationDate).getFullYear() > 1000 
      ? new Date(editingBook.publicationDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    pageCount: editingBook.pageCount || 1,
    language: editingBook.language || 'English',
    format: editingBook.format || 'Paperback',
    description: editingBook.description || '',
    coverImageUrl: editingBook.coverImageUrl || '',
    publisherId: editingBook.publisherId?.toString() || '',
    authorIds: editingBook.authors?.map(a => a.authorId.toString()) || [],
    genreIds: editingBook.genres?.map(g => g.genreId.toString()) || [],
    newPublisher: null,
    newAuthors: [],
    newGenres: [],
    newAuthorInProgress: [{ firstName: '', lastName: '', biography: '' }],
    newGenreInProgress: [{ name: '', description: '' }],
    isAwardWinning: editingBook.isAwardWinning || false,
    status: editingBook.status || 'Published',
    coverImageFile: null,
    bookId: editingBook.bookId // Ensure bookId is included in the form values
  } : {
    title: '',
    isbn: '',
    price: 0,
    publicationDate: new Date().toISOString().split('T')[0],
    pageCount: 1,
    language: 'English',
    format: 'Paperback',
    description: '',
    coverImageUrl: '',
    publisherId: '',
    authorIds: [],
    genreIds: [],
    newPublisher: null,
    newAuthors: [],
    newGenres: [],
    newAuthorInProgress: [{ firstName: '', lastName: '', biography: '' }],
    newGenreInProgress: [{ name: '', description: '' }],
    isAwardWinning: false,
    status: 'Published',
    coverImageFile: null
  };

  if (!isOpen) return null;

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const modalTitle = editingBook ? `Edit Book: ${editingBook.title}` : 'Add New Book';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="sticky top-0 z-20 bg-black border-b border-gray-300 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sticky top-[60px] z-10 pt-8 pb-4 bg-gray-100 border-b border-gray-200">
          <StepIndicator currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />
        </div>
        
        <Formik
          initialValues={initialValues}
          validationSchema={AddBookSchema}
          onSubmit={async (values, formikHelpers) => {
            const { setSubmitting } = formikHelpers;
            try {
              // Process the form data
              const processedValues = {
                ...values,
                isAwardWinning: !!values.isAwardWinning, // always boolean
                authorIds: values.authorIds.map(id => Number(id)),
                genreIds: values.genreIds.map(id => Number(id)),
                publisherId: values.publisherId ? Number(values.publisherId) : null
              };
              
              // Add bookId if editing
              if (editingBook) {
                processedValues.bookId = editingBook.bookId;
              }
              
              // Submit the data
              await onSubmit(processedValues, formikHelpers);
            } catch (error) {
              console.error("Form submission error:", error);
              setSubmitting(false);
            }
          }}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="p-6 flex-grow overflow-y-auto">
              <div className="min-h-[400px]">
                {currentStep === 0 && <BasicInfoStep />}
                {currentStep === 1 && <DetailsStep />}
                {currentStep === 2 && <PublisherStep publishers={publishers} />}
                {currentStep === 3 && <AuthorsStep authors={authors} />}
                {currentStep === 4 && <GenresStep genres={genres} />}
              </div>

              <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md border border-gray-300"
                  onClick={currentStep === 0 ? onClose : () => setCurrentStep(step => step - 1)}
                >
                  {currentStep === 0 ? 'Cancel' : 'Previous'}
                </button>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent any default form submission
                      setCurrentStep(step => step + 1);
                    }}
                    className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                    disabled={isSubmitting}
                    className="ml-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      editingBook ? 'Update Book' : 'Save Book'
                    )}
                    </button>
                  )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
} 