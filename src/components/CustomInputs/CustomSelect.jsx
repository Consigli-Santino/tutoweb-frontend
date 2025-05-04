import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import './CustomSelect.css';

/**
 * Componente Select personalizado basado en react-select
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.options - Array de opciones para el select [{id, nombre}]
 * @param {string|number} props.value - Valor seleccionado actualmente
 * @param {function} props.onChange - Función que se ejecuta al cambiar la selección
 * @param {string} props.placeholder - Texto para la opción por defecto
 * @param {boolean} props.disabled - Si el select está deshabilitado
 * @param {boolean} props.required - Si el select es obligatorio
 * @param {string} props.name - Nombre del select para formularios
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.id - ID del elemento
 * @param {string} props.labelKey - Clave para mostrar como texto (por defecto 'nombre')
 * @param {string} props.valueKey - Clave para usar como valor (por defecto 'id')
 * @param {string} props.variant - Variante del estilo ('light' o 'white')
 * @param {boolean} props.isSearchable - Si es posible buscar en el select
 * @param {boolean} props.isClearable - Si el valor puede ser limpiado
 */
const CustomSelect = ({
                          options = [],
                          value = '',
                          onChange,
                          placeholder = 'Seleccione una opción',
                          disabled = false,
                          required = false,
                          name = '',
                          className = '',
                          id = '',
                          labelKey = 'nombre',
                          valueKey = 'id',
                          variant = 'light',
                          isSearchable = true,
                          isClearable = false,
                          ...otherProps
                      }) => {
    // Transformar las opciones al formato que espera react-select
    const formattedOptions = options.map(option => ({
        value: option[valueKey]?.toString() || '',
        label: option[labelKey] || ''
    }));

    // Encontrar la opción seleccionada actualmente
    const selectedOption = value
        ? formattedOptions.find(option => option.value === value.toString())
        : null;

    // Manejar el cambio de valor
    const handleChange = (selected) => {
        if (onChange) {
            // Si el select es clearable, selected puede ser null
            const newValue = selected ? selected.value : '';

            // Simular un evento para mantener la compatibilidad con los manejadores existentes
            const fakeEvent = {
                target: {
                    name,
                    value: newValue,
                    type: 'select'
                }
            };

            onChange(fakeEvent);
        }
    };

    // Estilos personalizados para react-select
    const customStyles = {
        container: (provided) => ({
            ...provided,
            width: '100%',
        }),
        control: (provided, state) => ({
            ...provided,
            backgroundColor: variant === 'light' ? '#f8f9fa' : '#ffffff',
            minHeight: '31px',
            height: '31px',
            boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(40, 48, 72, 0.25)' : 'none',
            borderRadius: '0.3rem',
            border: 'none',
            '&:hover': {
                border: 'none'
            }
        }),
        valueContainer: (provided) => ({
            ...provided,
            height: '31px',
            padding: '0 8px',
            fontSize: '0.875rem'
        }),
        input: (provided) => ({
            ...provided,
            margin: '0',
            padding: '0',
            height: '23px'
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '31px'
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '0 8px'
        }),
        clearIndicator: (provided) => ({
            ...provided,
            padding: '0 8px'
        }),
        option: (provided, state) => ({
            ...provided,
            fontSize: '0.875rem',
            backgroundColor: state.isSelected
                ? '#283048'
                : state.isFocused
                    ? '#f0f0f0'
                    : null,
            color: state.isSelected ? '#fff' : '#333',
            '&:active': {
                backgroundColor: '#283048',
                color: '#fff'
            }
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '0.875rem',
            color: '#6c757d'
        }),
        singleValue: (provided) => ({
            ...provided,
            fontSize: '0.875rem'
        })
    };

    // No usar containerClass para evitar clases adicionales que puedan afectar al ancho

    return (
        <div className="custom-select-wrapper">
            <Select
                id={id}
                name={name}
                options={formattedOptions}
                value={selectedOption}
                onChange={handleChange}
                placeholder={placeholder}
                isDisabled={disabled}
                isSearchable={isSearchable}
                isClearable={isClearable}
                styles={customStyles}
                classNamePrefix="react-select"
                required={required}
                {...otherProps}
            />
            {/* Input oculto para manejar el required en formularios HTML */}
            {required && (
                <input
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ opacity: 0, height: 0, position: 'absolute' }}
                    value={value || ''}
                    onChange={() => {}}
                    required
                />
            )}
        </div>
    );
};

CustomSelect.propTypes = {
    options: PropTypes.array.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    name: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string,
    labelKey: PropTypes.string,
    valueKey: PropTypes.string,
    variant: PropTypes.oneOf(['light', 'white']),
    isSearchable: PropTypes.bool,
    isClearable: PropTypes.bool
};

export default CustomSelect;