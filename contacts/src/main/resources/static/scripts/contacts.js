document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const addContactBtn = document.getElementById('addContactBtn')
  const addContactModal = document.getElementById('addContactModal')
  const editContactModal = document.getElementById('editContactModal')
  const deleteConfirmModal = document.getElementById('deleteConfirmModal')
  const modalOverlay = document.getElementById('modalOverlay')

  const closeAddModal = document.getElementById('closeAddModal')
  const closeEditModal = document.getElementById('closeEditModal')
  const closeDeleteModal = document.getElementById('closeDeleteModal')
  const cancelDelete = document.getElementById('cancelDelete')

  const addProfilePicture = document.getElementById('addProfilePicture')
  const addProfilePreview = document.getElementById('addProfilePreview')
  const editProfilePicture = document.getElementById('editProfilePicture')
  const editProfilePreview = document.getElementById('editProfilePreview')

  const emailFieldsAdd = document.getElementById('emailFieldsAdd')
  const phoneFieldsAdd = document.getElementById('phoneFieldsAdd')
  const emailFieldsEdit = document.getElementById('emailFieldsEdit')
  const phoneFieldsEdit = document.getElementById('phoneFieldsEdit')

  const editButtons = document.querySelectorAll('.edit-btn')
  const deleteButtons = document.querySelectorAll('.delete-btn')

  // Modal Functions
  function openModal(modal) {
    modal.classList.add('active')
    modalOverlay.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  function closeModal(modal) {
    modal.classList.remove('active')
    modalOverlay.classList.remove('active')
    document.body.style.overflow = ''
  }

  function closeAllModals() {
    closeModal(addContactModal)
    closeModal(editContactModal)
    closeModal(deleteConfirmModal)
  }

  // Event Listeners for Modals
  addContactBtn.addEventListener('click', () => openModal(addContactModal))
  closeAddModal.addEventListener('click', () => closeModal(addContactModal))
  closeEditModal.addEventListener('click', () => closeModal(editContactModal))
  closeDeleteModal.addEventListener('click', () => closeModal(deleteConfirmModal))
  cancelDelete.addEventListener('click', () => closeModal(deleteConfirmModal))

  modalOverlay.addEventListener('click', closeAllModals)

  // Profile Picture Preview
  addProfilePicture.addEventListener('change', (event) => {
    handleImagePreview(event, addProfilePreview)
  })

  editProfilePicture.addEventListener('change', (event) => {
    handleImagePreview(event, editProfilePreview)
  })

  function handleImagePreview(event, previewElement) {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewElement.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Multiple Email and Phone Fields
  function addFieldListeners() {
    document.querySelectorAll('.add-field-btn').forEach((button) => {
      button.addEventListener('click', function () {
        const fieldType = this.dataset.field
        const container = this.closest('.multi-fields')
        addNewField(container, fieldType)
      })
    })

    document.querySelectorAll('.remove-field-btn').forEach((button) => {
      button.addEventListener('click', function () {
        this.closest('.field-container').remove()
      })
    })
  }

  function addNewField(container, fieldType) {
    const fieldContainer = document.createElement('div')
    fieldContainer.className = 'field-container'

    const input = document.createElement('input')
    input.type = fieldType === 'email' ? 'email' : 'tel'
    input.name = fieldType === 'email' ? 'emails[]' : 'phones[]'
    input.className = 'form-input'

    if (fieldType === 'phone') {
      input.pattern = '[0-9]{10,15}'
      input.title = 'Enter a valid phone number (10-15 digits)'
    }

    if (fieldType === 'email') {
      input.pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'
      input.title = 'Enter a valid email address'
    }

    const removeBtn = document.createElement('button')
    removeBtn.type = 'button'
    removeBtn.className = 'remove-field-btn'
    removeBtn.innerHTML = '<i class="fa-solid fa-minus"></i>'
    removeBtn.addEventListener('click', () => {
      fieldContainer.remove()
    })

    fieldContainer.appendChild(input)
    fieldContainer.appendChild(removeBtn)
    container.appendChild(fieldContainer)
  }

  // Initialize field listeners
  addFieldListeners()

  // Edit Contact
  editButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const contactId = this.dataset.id
      const name = this.dataset.name
      const picture = this.dataset.picture

      // Set basic contact info
      document.getElementById('editContactId').value = contactId
      document.getElementById('editName').value = name

      // Set profile picture
      if (picture && picture !== 'null') {
        editProfilePreview.src = picture
      } else {
        editProfilePreview.src = '/placeholder.svg?height=100&width=100'
      }

      // Clear existing email and phone fields
      emailFieldsEdit.innerHTML = '<div class="form-group"><label>Email</label></div>'
      phoneFieldsEdit.innerHTML = '<div class="form-group"><label>Phone</label></div>'

      // Add email fields
      try {
        const emails = JSON.parse(this.dataset.emails || '[]')
        const emailGroup = emailFieldsEdit.querySelector('.form-group')

        // Always create at least one email field
        if (emails.length === 0) {
          // Create empty field if no emails exist
          const inputWithButton = document.createElement('div')
          inputWithButton.className = 'input-with-button'

          const input = document.createElement('input')
          input.type = 'email'
          input.name = 'emails[]'
          input.className = 'form-input'
          input.required = true

          const addBtn = document.createElement('button')
          addBtn.type = 'button'
          addBtn.className = 'add-field-btn'
          addBtn.dataset.field = 'email'
          addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'

          inputWithButton.appendChild(input)
          inputWithButton.appendChild(addBtn)
          emailGroup.appendChild(inputWithButton)
        } else {
          emails.forEach((email, index) => {
            if (index === 0) {
              // First email field with add button
              const inputWithButton = document.createElement('div')
              inputWithButton.className = 'input-with-button'

              const input = document.createElement('input')
              input.type = 'email'
              input.name = 'emails[]'
              input.className = 'form-input'
              input.value = email.value || ''
              input.required = true

              const addBtn = document.createElement('button')
              addBtn.type = 'button'
              addBtn.className = 'add-field-btn'
              addBtn.dataset.field = 'email'
              addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'

              inputWithButton.appendChild(input)
              inputWithButton.appendChild(addBtn)
              emailGroup.appendChild(inputWithButton)
            } else {
              // Additional email fields with remove button
              const fieldContainer = document.createElement('div')
              fieldContainer.className = 'field-container'

              const input = document.createElement('input')
              input.type = 'email'
              input.name = 'emails[]'
              input.className = 'form-input'
              input.value = email.value || ''

              const removeBtn = document.createElement('button')
              removeBtn.type = 'button'
              removeBtn.className = 'remove-field-btn'
              removeBtn.innerHTML = '<i class="fa-solid fa-minus"></i>'

              fieldContainer.appendChild(input)
              fieldContainer.appendChild(removeBtn)
              emailFieldsEdit.appendChild(fieldContainer)
            }
          })
        }
      } catch (e) {
        console.error('Error parsing emails:', e)
        // Create default empty field in case of error
        const emailGroup = emailFieldsEdit.querySelector('.form-group')
        const inputWithButton = document.createElement('div')
        inputWithButton.className = 'input-with-button'

        const input = document.createElement('input')
        input.type = 'email'
        input.name = 'emails[]'
        input.className = 'form-input'
        input.required = true

        const addBtn = document.createElement('button')
        addBtn.type = 'button'
        addBtn.className = 'add-field-btn'
        addBtn.dataset.field = 'email'
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'

        inputWithButton.appendChild(input)
        inputWithButton.appendChild(addBtn)
        emailGroup.appendChild(inputWithButton)
      }

      // Add phone fields
      try {
        const phones = JSON.parse(this.dataset.phones || '[]')
        const phoneGroup = phoneFieldsEdit.querySelector('.form-group')

        // Always create at least one phone field
        if (phones.length === 0) {
          // Create empty field if no phones exist
          const inputWithButton = document.createElement('div')
          inputWithButton.className = 'input-with-button'

          const input = document.createElement('input')
          input.type = 'tel'
          input.name = 'phones[]'
          input.className = 'form-input'
          input.required = true
          input.pattern = '[0-9]{10,15}'
          input.title = 'Enter a valid phone number (10-15 digits)'

          const addBtn = document.createElement('button')
          addBtn.type = 'button'
          addBtn.className = 'add-field-btn'
          addBtn.dataset.field = 'phone'
          addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'

          inputWithButton.appendChild(input)
          inputWithButton.appendChild(addBtn)
          phoneGroup.appendChild(inputWithButton)
        } else {
          phones.forEach((phone, index) => {
            if (index === 0) {
              // First phone field with add button
              const inputWithButton = document.createElement('div')
              inputWithButton.className = 'input-with-button'

              const input = document.createElement('input')
              input.type = 'tel'
              input.name = 'phones[]'
              input.className = 'form-input'
              input.value = phone.value || ''
              input.required = true
              input.pattern = '[0-9]{10,15}'
              input.title = 'Enter a valid phone number (10-15 digits)'

              const addBtn = document.createElement('button')
              addBtn.type = 'button'
              addBtn.className = 'add-field-btn'
              addBtn.dataset.field = 'phone'
              addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'

              inputWithButton.appendChild(input)
              inputWithButton.appendChild(addBtn)
              phoneGroup.appendChild(inputWithButton)
            } else {
              // Additional phone fields with remove button
              const fieldContainer = document.createElement('div')
              fieldContainer.className = 'field-container'

              const input = document.createElement('input')
              input.type = 'tel'
              input.name = 'phones[]'
              input.className = 'form-input'
              input.value = phone.value || ''
              input.pattern = '[0-9]{10,15}'
              input.title = 'Enter a valid phone number (10-15 digits)'

              const removeBtn = document.createElement('button')
              removeBtn.type = 'button'
              removeBtn.className = 'remove-field-btn'
              removeBtn.innerHTML = '<i class="fa-solid fa-minus"></i>'

              fieldContainer.appendChild(input)
              fieldContainer.appendChild(removeBtn)
              phoneFieldsEdit.appendChild(fieldContainer)
            }
          })
        }
      } catch (e) {
        console.error('Error parsing phones:', e)
        // Create default empty field in case of error
        const phoneGroup = phoneFieldsEdit.querySelector('.form-group')
        const inputWithButton = document.createElement('div')
        inputWithButton.className = 'input-with-button'

        const input = document.createElement('input')
        input.type = 'tel'
        input.name = 'phones[]'
        input.className = 'form-input'
        input.required = true
        input.pattern = '[0-9]{10,15}'
        input.title = 'Enter a valid phone number (10-15 digits)'

        const addBtn = document.createElement('button')
        addBtn.type = 'button'
        addBtn.className = 'add-field-btn'
        addBtn.dataset.field = 'phone'
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'

        inputWithButton.appendChild(input)
        inputWithButton.appendChild(addBtn)
        phoneGroup.appendChild(inputWithButton)
      }

      // Add event listeners to new buttons
      addFieldListeners()

      // Open the edit modal
      openModal(editContactModal)
    })
  })

  // Delete Contact
  deleteButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const contactId = this.dataset.id
      document.getElementById('deleteContactId').value = contactId
      openModal(deleteConfirmModal)
    })
  })
})
