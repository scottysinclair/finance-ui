import styled from "styled-components";
import React, {createRef, useEffect, useRef, useState} from "react";
import FocusTrap from "focus-trap-react";

const round = n => Math.round((n + Number.EPSILON) * 100) / 100
const dataEntryKeys = new RegExp("^[a-zA-Z0-9! \b]$");
const createRefs1d = (existingArray, n) => Array(n).fill(null).map((_, i) => existingArray[i] || createRef())
const focusRef1d = (refArray, i) => refArray && refArray[i] && refArray[i].current && refArray[i].current.focus()


export const Categories = styled(({className, categories, changeCategoryFor, categoryChanged, getTransaction, quitCategoryMode}) => {
    const [selectCatRefs, setSelectCatRefs] = useState([]);
    const filterTextRef = useRef()
    const [filterText, setFilterText] = useState(null);

    const filteredCategories = () => categories.filter(c => !filterText || c.name.toLowerCase().includes(filterText.toLowerCase()))
    const indexOf = categoryName => filteredCategories().findIndex(c => c.name === categoryName)

    useEffect(() => {
        setSelectCatRefs(createRefs1d(selectCatRefs, categories.length));
    }, [categories.length]);

    useEffect(() => {
        if (changeCategoryFor) {
            if (filteredCategories().length === 0 && filterTextRef.current) {
                filterTextRef.current.focus()
            }
            else {
                const index = indexOf(getTransaction(changeCategoryFor).category)
                if (index >= 0) {
                    if (changeCategoryFor && selectCatRefs[0].current) selectCatRefs[index].current.focus()
                } else if (filterText && index === -1) {
                    if (changeCategoryFor && selectCatRefs[0].current) selectCatRefs[0].current.focus()
                }
            }
        }
        else {
            setFilterText(null)
        }
    }, [categories, changeCategoryFor, filterText])

    const SelectButton = ({i, name}) => {
        const props = changeCategoryFor ? {
            onKeyDown: e => {
                if (e.key === 'ArrowUp') focusRef1d(selectCatRefs, i-1)
                if (e.key === 'PageUp') focusRef1d(selectCatRefs, i-10 > 0 ? i-10 : 0)
                if (e.key === 'ArrowDown') focusRef1d(selectCatRefs, i+1)
                if (e.key === 'PageDown') focusRef1d(selectCatRefs, i+10 < selectCatRefs.length ? i + 10 : selectCatRefs.length - 1)
                return true
            },
            className: 'selectMode',
            onClick: () => categoryChanged(name)
        } : {
            disabled: true
        }
        return <button ref={selectCatRefs[i]} {...props} >{name}</button>
    }

    const tableKeyEvents = e => {
        if (e.key === 'Escape'  && filterText) setFilterText(null)
        if (e.key === 'Escape') quitCategoryMode()
        if (e.key === 'Backspace' && filterText) setFilterText(filterText.length > 0 ? filterText.substring(0, filterText.length-1) : null)
        if (dataEntryKeys.test(e.key)) {
            setFilterText(filterText ? filterText + e.key : e.key)
        }
    }

    return <FocusTrap active={changeCategoryFor !== null}>
        <div className={className} onKeyDown={tableKeyEvents}>
            { filterText && <header>
                <input readOnly={true} ref={filterTextRef} value={`name: ${filterText}`}/>
            </header> }
            <div className='tableContainer'>
                <table>
                    <thead>
                    <tr>
                        <th key='name-header'>Name</th>
                        <th key='total-header'>Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {  filteredCategories()
                        .filter((c => changeCategoryFor || c.total !== 0))
                        .map((c, i) => (<tr key={c.id}>
                            <td key='name'><SelectButton i={i} name={c.name}/></td>
                            <td key='total'><span>{round(c.total)}</span></td>
                        </tr>)) }
                    </tbody>
                </table>
            </div>
        </div>
    </FocusTrap>})` 
   position: relative; 
   margin-left: 5rem;
   div.tableContainer {
    overflow-y: auto; 
    max-height: 80vh;
    }    
   
   header {
     position: absolute;
     left: 0px;
     top: -2rem;
     display: block;
     border: 1px solid black;
     background: #ffffff;
     z-index: 2;
     
     input {
      display: inline-block;
      height: 1.4rem;
      padding: 0.25rem;
      border: none;
     }
   }
   
   th, td {
      position: relative;
      text-align: left;
      font-weight: normal;
      border: 1px solid #ccc;
    }
   th {
      position: sticky; top: 0;
      background: #ffffff;   
      padding-top: 0.3rem;
      padding-bottom: 0.3rem;
      padding-left: 1rem;
      padding-right: 1rem;
      z-index: 1;
   } 
   span {
    padding: 0.25rem;    
    padding-left: 1rem;
    padding-right: 1rem;
   } 
   button {
    display: inline-block;
    border: none;
    height: 1.9rem;    
    width: 100%;
    padding: 0.25rem;    
    padding-left: 1rem;
    padding-right: 1rem;
    background-color: transparent;
   }   
   button:focus {
    background-color: light-grey;
   }
   button:disabled {
    color: black;
   }
   selectMode:focus {
     outline: none
   }
`;
